import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { dbWrapperPromise } from '../db';

// パス解決: 開発時はプロジェクトルート、本番時はユーザーデータディレクトリ
const DATA_DIR = app.isPackaged
  ? path.join(app.getPath('userData'), 'data')
  : path.join(process.cwd(), 'data');
const RECORDS_DIR = path.join(DATA_DIR, 'records');

interface ExportJsonInput {
  templateId: string;
}

interface ExportCsvInput {
  templateId: string;
}

async function exportJsonBackup(input: ExportJsonInput) {
  try {
    const db = await dbWrapperPromise;
    const { templateId } = input;

    const documents = db
      .prepare('SELECT * FROM documents WHERE template_id = ? ORDER BY created_at DESC')
      .all(templateId) as any[];

    // Collect all versions
    const exportData: any[] = [];

    for (const doc of documents) {
      const versions = db
        .prepare('SELECT * FROM document_versions WHERE document_id = ? ORDER BY version ASC')
        .all(doc.id) as any[];

      for (const version of versions) {
        if (fs.existsSync(version.file_path)) {
          const jsonData = JSON.parse(fs.readFileSync(version.file_path, 'utf-8'));
          exportData.push({
            document: doc,
            version: version,
            data: jsonData
          });
        }
      }
    }

    // Open save dialog
    const result = await dialog.showSaveDialog({
      title: 'JSONバックアップを保存',
      defaultPath: `${templateId}_backup_${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, error: 'キャンセルされました' };
    }

    // Write backup file
    fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8');

    return { ok: true, path: result.filePath, count: exportData.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[exportJsonBackup] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

async function exportCsv(input: ExportCsvInput) {
  try {
    const db = await dbWrapperPromise;
    const { templateId } = input;

    const documents = db
      .prepare(`
        SELECT
          d.record_id,
          d.title,
          d.status,
          d.product_name,
          d.complaint_date,
          d.source_record_id,
          d.due_date,
          d.created_at,
          d.updated_at,
          d.latest_version
        FROM documents d
        WHERE d.template_id = ?
        ORDER BY d.created_at DESC
      `)
      .all(templateId) as any[];

    if (documents.length === 0) {
      return { ok: false, error: 'エクスポートするデータがありません' };
    }

    // Generate CSV
    const headers = Object.keys(documents[0]);
    const csvRows = [
      headers.join(','),
      ...documents.map(doc =>
        headers.map(header => {
          let value = doc[header];

          // Format dates
          if (header.includes('_at') || header.includes('_date')) {
            value = value ? new Date(value).toLocaleDateString('ja-JP') : '';
          }

          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value || '';
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');

    // Open save dialog
    const result = await dialog.showSaveDialog({
      title: 'CSVをエクスポート',
      defaultPath: `${templateId}_export_${new Date().toISOString().split('T')[0]}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, error: 'キャンセルされました' };
    }

    // Write CSV file with BOM for Excel compatibility
    const bom = '\uFEFF';
    fs.writeFileSync(result.filePath, bom + csvContent, 'utf-8');

    return { ok: true, path: result.filePath, count: documents.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[exportCsv] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

interface ImportJsonInput {
  templateId: string;
  merge: boolean;
}

async function importJsonBackup(input: ImportJsonInput) {
  try {
    const db = await dbWrapperPromise;
    const { templateId, merge } = input;

    // Open file dialog
    const result = await dialog.showOpenDialog({
      title: 'JSONバックアップを選択',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { ok: false, error: 'キャンセルされました' };
    }

    const filePath = result.filePaths[0];
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!Array.isArray(backupData) || backupData.length === 0) {
      return { ok: false, error: '無効なバックアップファイルです' };
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of backupData) {
      try {
        const { document, version, data } = item;

        if (!document || !version || !data) {
          console.warn('Invalid backup item, skipping:', item);
          skippedCount++;
          continue;
        }

        // Check if document already exists
        const existingDoc = db
          .prepare('SELECT id FROM documents WHERE record_id = ? AND template_id = ?')
          .get(document.record_id, templateId) as { id: number } | undefined;

        if (existingDoc && !merge) {
          // Skip if not merging
          skippedCount++;
          continue;
        }

        let documentId: number;

        if (existingDoc) {
          // Update existing document
          documentId = existingDoc.id;
          db.prepare(`
            UPDATE documents
            SET title = ?, latest_version = ?, updated_at = ?
            WHERE id = ?
          `).run(document.title, document.latest_version, document.updated_at, documentId);
        } else {
          // Create new document
          const result = db.prepare(`
            INSERT INTO documents (record_id, template_id, title, latest_version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            document.record_id,
            templateId,
            document.title,
            document.latest_version,
            document.created_at,
            document.updated_at
          );
          documentId = result.lastInsertRowid as number;
        }

        // Check if this version already exists
        const existingVersion = db
          .prepare('SELECT id FROM document_versions WHERE document_id = ? AND version = ?')
          .get(documentId, version.version);

        if (existingVersion) {
          skippedCount++;
          continue;
        }

        // Create file path for this version
        const recordDir = path.join(RECORDS_DIR, templateId.replace('_v1', ''));
        if (!fs.existsSync(recordDir)) {
          fs.mkdirSync(recordDir, { recursive: true });
        }

        const fileName = `${document.record_id}_v${version.version}.json`;
        const newFilePath = path.join(recordDir, fileName);

        // Write JSON file
        fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2), 'utf-8');

        // Insert version record
        db.prepare(`
          INSERT INTO document_versions (document_id, version, file_path, created_at, created_by)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          documentId,
          version.version,
          newFilePath,
          version.created_at,
          version.created_by
        );

        importedCount++;
      } catch (itemError) {
        const errorMsg = itemError instanceof Error ? itemError.message : String(itemError);
        errors.push(`Record ${item?.document?.record_id || 'unknown'}: ${errorMsg}`);
        console.error('[importJsonBackup] item error:', errorMsg);
      }
    }

    const summary = {
      ok: true,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    };

    return summary;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[importJsonBackup] error', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

export function setupExportHandlers() {
  ipcMain.handle('exportJsonBackup', async (_, input: ExportJsonInput) => {
    return await exportJsonBackup(input);
  });

  ipcMain.handle('exportCsv', async (_, input: ExportCsvInput) => {
    return await exportCsv(input);
  });

  ipcMain.handle('importJsonBackup', async (_, input: ImportJsonInput) => {
    return await importJsonBackup(input);
  });
}
