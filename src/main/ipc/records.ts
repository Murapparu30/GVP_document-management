import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { dbWrapperPromise } from '../db';
import { getDataPath } from '../config';

// パス解決: 設定に基づいて動的に決定
function getDataDir(): string {
  return getDataPath();
}

function resolveRecordDir(templateId: string): string {
  if (templateId === 'complaint_record_v1') return 'complaint';
  if (templateId === 'corrective_action_v1') return 'corrective';
  return templateId;
}

type SaveRecordInput = {
  templateId: string;
  recordId: string;
  data: any;
  user: string;
};

type GetRecordVersionInput = {
  recordId: string;
  templateId: string;
  version: number;
};

interface RecordVersionPayload {
  meta: {
    record_id: string;
    template_id: string;
    version: number;
    created_at: string;
    updated_at: string;
    updated_by: string;
  };
  data: any;
}

export function setupRecordHandlers() {
  ipcMain.handle('saveRecord', async (_, input: SaveRecordInput) => {
    try {
      const db = await dbWrapperPromise;
      const now = new Date().toISOString();

      const existingDoc = db.prepare(
        'SELECT id, latest_version, created_at FROM documents WHERE record_id = ? AND template_id = ?'
      ).get(input.recordId, input.templateId) as { id: number; latest_version: number; created_at: string } | undefined;

      let version: number;
      let documentId: number;
      let createdAt: string;

      if (!existingDoc) {
        version = 1;
        createdAt = now;

        const title = `${input.recordId} ${input.data.product_name || ''}`.trim();

        const insertDoc = db.prepare(`
          INSERT INTO documents (
            record_id, template_id, latest_version, title, status,
            product_name, complaint_date, source_record_id, due_date,
            created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertDoc.run(
          input.recordId,
          input.templateId,
          version,
          title,
          input.data.status || null,
          input.data.product_name || null,
          input.data.complaint_date || null,
          input.data.source_record_id || null,
          input.data.due_date || null,
          createdAt,
          now
        );

        documentId = result.lastInsertRowid as number;
      } else {
        version = existingDoc.latest_version + 1;
        documentId = existingDoc.id;
        createdAt = existingDoc.created_at;

        const title = `${input.recordId} ${input.data.product_name || ''}`.trim();

        db.prepare(`
          UPDATE documents
          SET latest_version = ?,
              title = ?,
              status = ?,
              product_name = ?,
              complaint_date = ?,
              source_record_id = ?,
              due_date = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          version,
          title,
          input.data.status || null,
          input.data.product_name || null,
          input.data.complaint_date || null,
          input.data.source_record_id || null,
          input.data.due_date || null,
          now,
          documentId
        );
      }

      const subDir = resolveRecordDir(input.templateId);
      // Change: Create dedicated folder for the record
      const recordDir = path.join(getDataDir(), 'records', subDir, input.recordId);
      const fileName = `${input.recordId}_v${version}.json`;
      const filePath = path.join(recordDir, fileName);

      const json = {
        meta: {
          record_id: input.recordId,
          template_id: input.templateId,
          version,
          created_at: createdAt,
          updated_at: now,
          updated_by: input.user
        },
        data: input.data
      };

      await fs.promises.mkdir(recordDir, { recursive: true });
      await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');

      db.prepare(`
        INSERT INTO document_versions (document_id, version, file_path, status, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(documentId, version, filePath, input.data.status || null, now, input.user);

      return { ok: true, filePath };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('openRecordFolder', async (_, recordId: string, templateId: string) => {
    const { shell } = require('electron'); // Import dynamically to avoid top-level issues if any
    try {
      const subDir = resolveRecordDir(templateId);
      const recordDir = path.join(getDataDir(), 'records', subDir, recordId);

      // Check if specific folder exists
      if (fs.existsSync(recordDir)) {
        await shell.openPath(recordDir);
        return { ok: true };
      }

      // Fallback: Open the category folder (legacy behavior support)
      const categoryDir = path.join(getDataDir(), 'records', subDir);
      if (fs.existsSync(categoryDir)) {
        await shell.openPath(categoryDir);
        return { ok: true, message: 'Opened parent folder (record folder not found)' };
      }

      return { ok: false, error: 'Folder not found' };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('getRecordVersion', async (_, input: GetRecordVersionInput) => {
    try {
      const db = await dbWrapperPromise;
      const document = db.prepare(
        'SELECT id FROM documents WHERE record_id = ? AND template_id = ?'
      ).get(input.recordId, input.templateId) as { id: number } | undefined;

      if (!document) {
        return { ok: false, error: 'document not found' };
      }

      const version = db.prepare(
        'SELECT file_path FROM document_versions WHERE document_id = ? AND version = ?'
      ).get(document.id, input.version) as { file_path: string } | undefined;

      if (!version) {
        return { ok: false, error: 'document version not found' };
      }

      const jsonContent = await fs.promises.readFile(version.file_path, 'utf-8');
      const payload = JSON.parse(jsonContent) as RecordVersionPayload;

      return { ok: true, data: payload };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
