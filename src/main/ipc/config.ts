import { ipcMain, dialog } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getConfig, saveConfig, getDataPath, AppConfig } from '../config';

export function setupConfigHandlers() {
    // Get current configuration
    ipcMain.handle('getConfig', async () => {
        return getConfig();
    });

    // Save configuration
    ipcMain.handle('saveConfig', async (_, config: AppConfig) => {
        try {
            saveConfig(config);
            return { ok: true };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    // Get current data path
    ipcMain.handle('getDataPath', async () => {
        return getDataPath();
    });

    // Open folder picker dialog
    ipcMain.handle('selectDataFolder', async () => {
        const result = await dialog.showOpenDialog({
            title: 'データ保存先フォルダを選択',
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: '選択'
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { ok: false, canceled: true };
        }

        const selectedPath = result.filePaths[0];

        // Verify the folder is writable by trying to create subdirectories
        try {
            const testDirs = ['db', 'records', 'templates', 'custom_templates', 'exports'];
            for (const dir of testDirs) {
                const dirPath = join(selectedPath, dir);
                if (!existsSync(dirPath)) {
                    mkdirSync(dirPath, { recursive: true });
                }
            }
            return { ok: true, path: selectedPath };
        } catch (error) {
            return {
                ok: false,
                error: `フォルダへの書き込みができません: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    });

    // Reset to default data path
    ipcMain.handle('resetDataPath', async () => {
        try {
            const config = getConfig();
            config.dataPath = null;
            saveConfig(config);
            return { ok: true };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    console.log('[config handlers] Registered');
}
