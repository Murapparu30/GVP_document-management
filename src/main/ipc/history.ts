import { ipcMain } from 'electron';
import fs from 'fs';
import { dbWrapperPromise } from '../db';

export interface RecordVersionInfo {
  id: number;
  version: number;
  file_path: string;
  status?: string;
  created_at: string;
  created_by: string;
}

interface ListVersionsInput {
  recordId: string;
  templateId: string;
}

async function listVersions(input: ListVersionsInput): Promise<{ ok: boolean; versions?: RecordVersionInfo[]; error?: string }> {
  try {
    const db = await dbWrapperPromise;
    if (!input.recordId || !input.templateId) {
      return { ok: false, error: 'Missing required parameters: recordId and templateId' };
    }

    const document = db.prepare(
      'SELECT id FROM documents WHERE record_id = ? AND template_id = ?'
    ).get(input.recordId, input.templateId) as { id: number } | undefined;

    if (!document) {
      return { ok: false, error: `Document not found: ${input.recordId} (${input.templateId})` };
    }

    const versions = db.prepare(`
      SELECT
        id,
        version,
        file_path,
        status,
        created_at,
        created_by
      FROM document_versions
      WHERE document_id = ?
      ORDER BY version DESC
    `).all(document.id) as RecordVersionInfo[];

    return { ok: true, versions };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('listVersions error:', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

interface GetVersionDataInput {
  recordId: string;
  templateId: string;
  version: number;
}

async function getVersionData(input: GetVersionDataInput): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const db = await dbWrapperPromise;
    if (!input.recordId || !input.templateId || !input.version) {
      return { ok: false, error: 'Missing required parameters: recordId, templateId, and version' };
    }

    const document = db.prepare(
      'SELECT id FROM documents WHERE record_id = ? AND template_id = ?'
    ).get(input.recordId, input.templateId) as { id: number } | undefined;

    if (!document) {
      return { ok: false, error: `Document not found: ${input.recordId} (${input.templateId})` };
    }

    const versionRow = db.prepare(
      'SELECT file_path FROM document_versions WHERE document_id = ? AND version = ?'
    ).get(document.id, input.version) as { file_path: string } | undefined;

    if (!versionRow) {
      return { ok: false, error: `Version not found: v${input.version} for ${input.recordId}` };
    }

    if (!fs.existsSync(versionRow.file_path)) {
      return { ok: false, error: `Record file not found: ${versionRow.file_path}` };
    }

    const recordJson = await fs.promises.readFile(versionRow.file_path, 'utf-8');
    const recordPayload = JSON.parse(recordJson);

    return { ok: true, data: recordPayload };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('getVersionData error:', errorMessage);
    return { ok: false, error: errorMessage };
  }
}

export function registerHistoryHandlers() {
  ipcMain.handle('listVersions', async (_event, input: ListVersionsInput) => {
    return await listVersions(input);
  });

  ipcMain.handle('getVersionData', async (_event, input: GetVersionDataInput) => {
    return await getVersionData(input);
  });
}
