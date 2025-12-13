import { ipcMain } from 'electron';
import { dbWrapperPromise } from '../db';

type DocumentRow = {
  id: number;
  record_id: string;
  template_id: string;
  latest_version: number;
  title: string | null;
  status: string | null;
  product_name: string | null;
  complaint_date: string | null;
  created_at: string;
  updated_at: string;
};

export interface DocumentSummary {
  id: number;
  record_id: string;
  template_id: string;
  latest_version: number;
  title: string;
  status?: string;
  product_name?: string;
  complaint_date?: string;
  created_at: string;
  updated_at: string;
}

export function setupDocumentHandlers() {
  ipcMain.handle('listDocuments', async (_, templateId: string): Promise<DocumentSummary[]> => {
    const db = await dbWrapperPromise;
    const rows = db.prepare(`
      SELECT
        id,
        record_id,
        template_id,
        latest_version,
        title,
        status,
        product_name,
        complaint_date,
        created_at,
        updated_at
      FROM documents
      WHERE template_id = ?
      ORDER BY updated_at DESC
    `).all(templateId) as DocumentRow[];

    return rows.map(row => ({
      id: row.id,
      record_id: row.record_id,
      template_id: row.template_id,
      latest_version: row.latest_version,
      title: row.title || '',
      status: row.status || undefined,
      product_name: row.product_name || undefined,
      complaint_date: row.complaint_date || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  });
}
