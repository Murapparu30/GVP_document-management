import { ipcMain, app, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { dbWrapperPromise } from '../db';
import { getCustomTemplatesPath } from '../config';

// 読み取り専用のビルトインテンプレート
const BUILTIN_TEMPLATES_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'data', 'templates')
  : path.join(process.cwd(), 'data', 'templates');

// カスタムテンプレートパスを動的に取得
function getCustomTemplatesDir(): string {
  const dir = getCustomTemplatesPath();
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function setupTemplateHandlers() {
  ipcMain.handle('getTemplate', async (_, templateId: string) => {
    // Try custom templates first, then built-in
    let filePath = path.join(getCustomTemplatesDir(), `${templateId}.json`);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(BUILTIN_TEMPLATES_DIR, `${templateId}.json`);
    }
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  });

  ipcMain.handle('listTemplates', async () => {
    const templates: any[] = [];
    const seenIds = new Set<string>();

    // Load from both directories
    const customDir = getCustomTemplatesDir();
    for (const dir of [customDir, BUILTIN_TEMPLATES_DIR]) {
      if (!fs.existsSync(dir)) continue;
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(dir, file);
        try {
          const raw = await fs.promises.readFile(filePath, 'utf-8');
          const template = JSON.parse(raw);
          if (!seenIds.has(template.template_id)) {
            seenIds.add(template.template_id);
            templates.push({
              template_id: template.template_id,
              template_name: template.template_name,
              category: template.category,
              version: template.version,
              isCustom: dir === customDir
            });
          }
        } catch {
          // Skip invalid files
        }
      }
    }
    return templates;
  });

  ipcMain.handle('importTemplate', async (_, user: string) => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'テンプレートをインポート',
        filters: [
          { name: 'Template Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { ok: false, canceled: true };
      }

      const sourcePath = result.filePaths[0];
      const raw = await fs.promises.readFile(sourcePath, 'utf-8');
      const template = JSON.parse(raw);

      // Validate required fields
      if (!template.template_id || !template.template_name || !template.fields) {
        return { ok: false, error: 'テンプレートの形式が無効です（template_id, template_name, fields が必要）' };
      }

      // Save to templates directory
      const destPath = path.join(getCustomTemplatesDir(), `${template.template_id}.json`);
      await fs.promises.writeFile(destPath, JSON.stringify(template, null, 2), 'utf-8');

      // Log the import
      const db = await dbWrapperPromise;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO template_logs (template_id, template_name, action, created_at, created_by, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(template.template_id, template.template_name, 'import', now, user, `Imported from: ${sourcePath}`);

      return { ok: true, template_id: template.template_id, template_name: template.template_name };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('deleteTemplate', async (_, templateId: string, user: string) => {
    try {
      const filePath = path.join(getCustomTemplatesDir(), `${templateId}.json`);

      // Check if it's a custom template (only custom can be deleted)
      if (!fs.existsSync(filePath)) {
        return { ok: false, error: 'テンプレートが見つからないか、ビルトインテンプレートです' };
      }

      // Read template info before deletion
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const template = JSON.parse(raw);

      // Delete the file
      await fs.promises.unlink(filePath);

      // Log the deletion
      const db = await dbWrapperPromise;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO template_logs (template_id, template_name, action, created_at, created_by, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(templateId, template.template_name, 'delete', now, user, JSON.stringify(template));

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('getTemplateLogs', async () => {
    const db = await dbWrapperPromise;
    const logs = db.prepare(`
      SELECT * FROM template_logs ORDER BY created_at DESC
    `).all();
    return { ok: true, logs };
  });
}
