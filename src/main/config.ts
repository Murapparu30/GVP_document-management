import { app } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface AppConfig {
    dataPath: string | null;  // null = use default
}

const defaultConfig: AppConfig = {
    dataPath: null
};

// Config is always stored in the user's data directory (not in shared folder)
const configDir = join(app.getPath('userData'), 'config');
const configPath = join(configDir, 'config.json');

let currentConfig: AppConfig = { ...defaultConfig };

export function loadConfig(): AppConfig {
    try {
        if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
        }

        if (existsSync(configPath)) {
            const data = readFileSync(configPath, 'utf-8');
            const loaded = JSON.parse(data) as Partial<AppConfig>;
            currentConfig = { ...defaultConfig, ...loaded };
        }
    } catch (error) {
        console.error('[config] Failed to load config:', error);
        currentConfig = { ...defaultConfig };
    }

    return currentConfig;
}

export function saveConfig(config: AppConfig): void {
    try {
        if (!existsSync(configDir)) {
            mkdirSync(configDir, { recursive: true });
        }

        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        currentConfig = { ...config };
        console.log('[config] Config saved:', configPath);
    } catch (error) {
        console.error('[config] Failed to save config:', error);
        throw error;
    }
}

export function getConfig(): AppConfig {
    return currentConfig;
}

// Get the effective data path (custom or default)
export function getDataPath(): string {
    if (currentConfig.dataPath && existsSync(currentConfig.dataPath)) {
        return currentConfig.dataPath;
    }

    // Default path
    return app.isPackaged
        ? join(app.getPath('userData'), 'data')
        : join(process.cwd(), 'data');
}

// Get specific sub-paths
export function getDbPath(): string {
    return join(getDataPath(), 'db');
}

export function getRecordsPath(): string {
    return join(getDataPath(), 'records');
}

export function getTemplatesPath(): string {
    return join(getDataPath(), 'templates');
}

export function getCustomTemplatesPath(): string {
    return join(getDataPath(), 'custom_templates');
}

export function getExportsPath(): string {
    return join(getDataPath(), 'exports');
}
