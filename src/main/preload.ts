import { contextBridge, ipcRenderer } from 'electron';

/**
 * QMS Local App - Electron API
 * すべてのIPCをRendererプロセスへ安全に公開
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /* -------------------------
   * Platform Info
   * ------------------------- */
  platform: process.platform,

  /* -------------------------
   * Templates
   * ------------------------- */
  getTemplate: (templateId: string) => ipcRenderer.invoke('getTemplate', templateId),
  listTemplates: () => ipcRenderer.invoke('listTemplates'),
  importTemplate: (user: string) => ipcRenderer.invoke('importTemplate', user),
  deleteTemplate: (templateId: string, user: string) => ipcRenderer.invoke('deleteTemplate', templateId, user),
  getTemplateLogs: () => ipcRenderer.invoke('getTemplateLogs'),

  /* -------------------------
   * Records (苦情処理記録 / 是正処置記録)
   * ------------------------- */
  saveRecord: (payload: any) => ipcRenderer.invoke('saveRecord', payload),
  listDocuments: (templateId: string) => ipcRenderer.invoke('listDocuments', templateId),
  getRecordVersion: (recordId: string, templateId: string, version: number) =>
    ipcRenderer.invoke('getRecordVersion', { recordId, templateId, version }),
  openRecordFolder: (recordId: string, templateId: string) =>
    ipcRenderer.invoke('openRecordFolder', recordId, templateId),

  /* -------------------------
   * PDF Export
   * ------------------------- */
  generatePdf: (payload: any) => ipcRenderer.invoke('generatePdf', payload),
  listPdfExports: (recordId: string, templateId: string) =>
    ipcRenderer.invoke('listPdfExports', { recordId, templateId }),
  openPdfFile: (filePath: string) => ipcRenderer.invoke('openPdfFile', filePath),

  /* -------------------------
   * Version History & Diff
   * ------------------------- */
  listVersions: (recordId: string, templateId: string) =>
    ipcRenderer.invoke('listVersions', { recordId, templateId }),
  getVersionData: (recordId: string, templateId: string, version: number) =>
    ipcRenderer.invoke('getVersionData', { recordId, templateId, version }),

  /* -------------------------
   * Users (ユーザー管理)
   * ------------------------- */
  listUsers: () => ipcRenderer.invoke('listUsers'),
  createUser: (user: { username: string; full_name: string; department: string; role: string }) => ipcRenderer.invoke('createUser', user),
  updateUser: (user: { id: number; full_name?: string; department?: string; role?: string }) => ipcRenderer.invoke('updateUser', user),
  deleteUser: (userId: number) => ipcRenderer.invoke('deleteUser', userId),
  updateLastLogin: (username: string) => ipcRenderer.invoke('updateLastLogin', username),

  /* -------------------------
   * Export / Import
   * ------------------------- */
  exportJsonBackup: (templateId: string) => ipcRenderer.invoke('exportJsonBackup', { templateId }),
  exportCsv: (templateId: string) => ipcRenderer.invoke('exportCsv', { templateId }),
  importJsonBackup: (templateId: string, merge: boolean) => ipcRenderer.invoke('importJsonBackup', { templateId, merge }),

  /* -------------------------
   * Dashboard
   * ------------------------- */
  getDashboardStats: () => ipcRenderer.invoke('getDashboardStats'),

  /* -------------------------
   * Settings (設定)
   * ------------------------- */
  getConfig: () => ipcRenderer.invoke('getConfig'),
  saveConfig: (config: { dataPath: string | null }) => ipcRenderer.invoke('saveConfig', config),
  getDataPath: () => ipcRenderer.invoke('getDataPath'),
  selectDataFolder: () => ipcRenderer.invoke('selectDataFolder'),
  resetDataPath: () => ipcRenderer.invoke('resetDataPath'),
});
