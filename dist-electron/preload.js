import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  /* -------------------------
   * Platform Info
   * ------------------------- */
  platform: process.platform,
  /* -------------------------
   * Templates
   * ------------------------- */
  getTemplate: (templateId) => ipcRenderer.invoke("getTemplate", templateId),
  listTemplates: () => ipcRenderer.invoke("listTemplates"),
  importTemplate: (user) => ipcRenderer.invoke("importTemplate", user),
  deleteTemplate: (templateId, user) => ipcRenderer.invoke("deleteTemplate", templateId, user),
  getTemplateLogs: () => ipcRenderer.invoke("getTemplateLogs"),
  /* -------------------------
   * Records (苦情処理記録 / 是正処置記録)
   * ------------------------- */
  saveRecord: (payload) => ipcRenderer.invoke("saveRecord", payload),
  listDocuments: (templateId) => ipcRenderer.invoke("listDocuments", templateId),
  getRecordVersion: (recordId, templateId, version) => ipcRenderer.invoke("getRecordVersion", { recordId, templateId, version }),
  openRecordFolder: (recordId, templateId) => ipcRenderer.invoke("openRecordFolder", recordId, templateId),
  /* -------------------------
   * PDF Export
   * ------------------------- */
  generatePdf: (payload) => ipcRenderer.invoke("generatePdf", payload),
  listPdfExports: (recordId, templateId) => ipcRenderer.invoke("listPdfExports", { recordId, templateId }),
  openPdfFile: (filePath) => ipcRenderer.invoke("openPdfFile", filePath),
  /* -------------------------
   * Version History & Diff
   * ------------------------- */
  listVersions: (recordId, templateId) => ipcRenderer.invoke("listVersions", { recordId, templateId }),
  getVersionData: (recordId, templateId, version) => ipcRenderer.invoke("getVersionData", { recordId, templateId, version }),
  /* -------------------------
   * Users (ユーザー管理)
   * ------------------------- */
  listUsers: () => ipcRenderer.invoke("listUsers"),
  createUser: (user) => ipcRenderer.invoke("createUser", user),
  updateUser: (user) => ipcRenderer.invoke("updateUser", user),
  deleteUser: (userId) => ipcRenderer.invoke("deleteUser", userId),
  updateLastLogin: (username) => ipcRenderer.invoke("updateLastLogin", username),
  /* -------------------------
   * Export / Import
   * ------------------------- */
  exportJsonBackup: (templateId) => ipcRenderer.invoke("exportJsonBackup", { templateId }),
  exportCsv: (templateId) => ipcRenderer.invoke("exportCsv", { templateId }),
  importJsonBackup: (templateId, merge) => ipcRenderer.invoke("importJsonBackup", { templateId, merge }),
  /* -------------------------
   * Dashboard
   * ------------------------- */
  getDashboardStats: () => ipcRenderer.invoke("getDashboardStats"),
  /* -------------------------
   * Settings (設定)
   * ------------------------- */
  getConfig: () => ipcRenderer.invoke("getConfig"),
  saveConfig: (config) => ipcRenderer.invoke("saveConfig", config),
  getDataPath: () => ipcRenderer.invoke("getDataPath"),
  selectDataFolder: () => ipcRenderer.invoke("selectDataFolder"),
  resetDataPath: () => ipcRenderer.invoke("resetDataPath")
});
