import { app, BrowserWindow } from 'electron';
import path from 'path';

import { setupTemplateHandlers } from './ipc/templates';
import { setupRecordHandlers } from './ipc/records';
import { setupDocumentHandlers } from './ipc/documents';
import { setupPdfHandlers } from './ipc/pdf';
import { registerHistoryHandlers } from './ipc/history';
import { setupExportHandlers } from './ipc/export';
import { setupUserHandlers } from './ipc/users';
import { setupConfigHandlers } from './ipc/config';
import { setupFirstRun, isFirstRun } from './setup/firstRun';
import { loadConfig } from './config';
import './ipc/dashboard';
// NOTE: db initialization moved to app.whenReady() to avoid top-level DB load errors

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Note: Both main and preload now use ESM (.js)
      preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
  }

  // Always open DevTools in development (helps debug)
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log('[Main] app.whenReady triggered');
  console.log('[Main] VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL);

  // Initialize DB as early as possible in the ready lifecycle
  try {
    console.log('[Main] Initializing database...');
    await import('./db');
    console.log('[Main] Database initialized successfully');
  } catch (err) {
    console.error('[Main] Failed to initialize database:', err);
  }

  // 初回起動時のセットアップ
  const firstRun = isFirstRun();
  if (firstRun) {
    console.log('🚀 First run detected - Setting up application...');
    setupFirstRun();
  }

  // IPCハンドラの登録
  console.log('[Main] Registering IPC handlers...');
  loadConfig(); // Load config before registering handlers
  setupConfigHandlers();
  setupTemplateHandlers();
  setupRecordHandlers();
  setupDocumentHandlers();
  setupPdfHandlers();
  registerHistoryHandlers();
  setupExportHandlers();
  setupUserHandlers();
  console.log('[Main] IPC handlers registered');

  // メインウィンドウの作成
  console.log('[Main] Creating main window...');
  createWindow();
  console.log('[Main] Main window created');

  if (firstRun) {
    console.log('✅ Application setup completed successfully!');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
