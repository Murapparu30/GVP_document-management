import { ipcMain, shell, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { dbWrapperPromise } from '../db';
import { generatePdf as generatePdfFile } from '../pdf/generator';

// パス解決: 開発時はプロジェクトルート、本番時はリソースディレクトリ
const DATA_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'data')
  : path.join(process.cwd(), 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

interface GeneratePdfInput {
  recordId: string;
  templateId: string;
  version?: number;
  exportedBy: string;
  purpose?: string;
}

async function generatePdf(input: GeneratePdfInput) {
  try {
    const db = await dbWrapperPromise;
    if (!input.recordId || !input.templateId || !input.exportedBy) {
      return { ok: false, error: 'Missing required parameters: recordId, templateId, and exportedBy are required' };
    }

    const document = db.prepare(
      'SELECT id, latest_version FROM documents WHERE record_id = ? AND template_id = ?'
    ).get(input.recordId, input.templateId) as { id: number; latest_version: number } | undefined;

    if (!document) {
      return { ok: false, error: `Document not found: ${input.recordId} (${input.templateId})` };
    }

    const version = input.version || document.latest_version;

    const versionRow = db.prepare(
      'SELECT file_path FROM document_versions WHERE document_id = ? AND version = ?'
    ).get(document.id, version) as { file_path: string } | undefined;

    if (!versionRow) {
      return { ok: false, error: `Version not found: v${version} for ${input.recordId}` };
    }

    if (!fs.existsSync(versionRow.file_path)) {
      return { ok: false, error: `Record file not found: ${versionRow.file_path}` };
    }

    const recordJson = await fs.promises.readFile(versionRow.file_path, 'utf-8');
    const recordPayload = JSON.parse(recordJson);

    const templatePath = path.join(DATA_DIR, 'templates', `${input.templateId}.json`);
    if (!fs.existsSync(templatePath)) {
      return { ok: false, error: `Template file not found: ${input.templateId}.json` };
    }

    const templateJson = await fs.promises.readFile(templatePath, 'utf-8');
    const template = JSON.parse(templateJson);

    const layoutPath = path.join(DATA_DIR, 'layouts', `${input.templateId}_layout.json`);
    if (!fs.existsSync(layoutPath)) {
      return { ok: false, error: `Layout file not found: ${input.templateId}_layout.json` };
    }

    const layoutJson = await fs.promises.readFile(layoutPath, 'utf-8');
    const layout = JSON.parse(layoutJson);

    const templateExportDir = path.join(EXPORTS_DIR, input.templateId);
    await fs.promises.mkdir(templateExportDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `${input.recordId}_v${version}_${timestamp}.pdf`;
    const outputPath = path.join(templateExportDir, fileName);

    await generatePdfFile({
      recordPayload,
      template,
      layout,
      outputPath,
      exportedBy: input.exportedBy,
      purpose: input.purpose
    });

    if (!fs.existsSync(outputPath)) {
      return { ok: false, error: 'PDF generation failed: output file was not created' };
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO pdf_exports (document_id, version, file_path, exported_at, exported_by, purpose)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      document.id,
      version,
      outputPath,
      now,
      input.exportedBy,
      input.purpose || null
    );

    return { ok: true, path: outputPath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF generation error:', errorMessage, error);
    return { ok: false, error: `PDF generation failed: ${errorMessage}` };
  }
}

interface ListPdfExportsInput {
  recordId: string;
  templateId: string;
}

interface PdfExportLogRow {
  id: number;
  document_id: number;
  version: number;
  file_path: string;
  exported_at: string;
  exported_by: string;
  purpose: string | null;
}

async function listPdfExports(input: ListPdfExportsInput) {
  try {
    const db = await dbWrapperPromise;
    const { recordId, templateId } = input;

    const docRow = db
      .prepare('SELECT id FROM documents WHERE record_id = ? AND template_id = ?')
      .get(recordId, templateId) as { id: number } | undefined;

    if (!docRow) {
      return { ok: true, logs: [] as PdfExportLogRow[] };
    }

    const rows = db
      .prepare(
        `SELECT id, document_id, version, file_path, exported_at, exported_by, purpose
         FROM pdf_exports
         WHERE document_id = ?
         ORDER BY exported_at DESC`
      )
      .all(docRow.id) as PdfExportLogRow[];

    return { ok: true, logs: rows };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[listPdfExports] error', errorMessage);
    return { ok: false, error: errorMessage || 'unknown error' };
  }
}

export function setupPdfHandlers() {
  ipcMain.handle('generatePdf', async (_, input: GeneratePdfInput) => {
    return await generatePdf(input);
  });

  ipcMain.handle('listPdfExports', async (_, input: ListPdfExportsInput) => {
    return await listPdfExports(input);
  });

  ipcMain.handle('openPdfFile', async (_, filePath: string) => {
    try {
      if (!filePath) {
        return { ok: false, error: 'File path is required' };
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { ok: false, error: `File not found: ${filePath}` };
      }

      // Open the file with the default PDF viewer
      const result = await shell.openPath(filePath);

      if (result) {
        // If result is not empty, it means there was an error
        return { ok: false, error: result };
      }

      return { ok: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[openPdfFile] error', errorMessage);
      return { ok: false, error: errorMessage };
    }
  });
}
