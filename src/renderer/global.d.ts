import type { TemplateDefinition } from './types/template';
import type { RecordData } from './types/record';

export interface DocumentSummary {
  id: number;
  record_id: string;
  template_id: string;
  latest_version: number;
  title: string;
  status?: string;
  product_name?: string;
  complaint_date?: string;
  source_record_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordVersionInfo {
  id: number;
  version: number;
  file_path: string;
  created_at: string;
  created_by: string;
}

export interface RecordVersionPayload {
  meta: {
    record_id: string;
    template_id: string;
    version: number;
    created_at: string;
    updated_at: string;
    updated_by: string;
  };
  data: RecordData;
}

export interface GeneratePdfInput {
  recordId: string;
  templateId: string;
  version?: number;
  exportedBy: string;
  purpose?: string;
}

export interface PdfExportLog {
  id: number;
  document_id: number;
  version: number;
  file_path: string;
  exported_at: string;
  exported_by: string;
  purpose: string | null;
}

export interface RecentRecord {
  record_id: string;
  title: string;
  status: string | null;
  updated_at: string;
}

export interface DashboardStats {
  complaint: {
    total: number;
    byStatus: { status: string; count: number }[];
    openCount: number;
    completedCount: number;
    completionRate: number;
    lastUpdatedAt: string | null;
    recent: RecentRecord[];
  };
  corrective: {
    total: number;
    byStatus: { status: string; count: number }[];
    openCount: number;
    completedCount: number;
    completionRate: number;
    overdueCount: number;
    dueSoonCount: number;
    lastUpdatedAt: string | null;
    recent: RecentRecord[];
  };
  lastRefreshedAt: string;
}

export interface TemplateSummary {
  template_id: string;
  template_name: string;
  category: string;
  version: string;
  isCustom?: boolean;
}

export interface TemplateLog {
  id: number;
  template_id: string;
  template_name: string;
  action: string;
  created_at: string;
  created_by: string;
  details: string | null;
}

declare global {
  interface Window {
    electronAPI: {
      // Templates
      getTemplate(templateId: string): Promise<TemplateDefinition>;
      listTemplates(): Promise<TemplateSummary[]>;
      importTemplate(user: string): Promise<{ ok: boolean; canceled?: boolean; template_id?: string; template_name?: string; error?: string }>;
      deleteTemplate(templateId: string, user: string): Promise<{ ok: boolean; error?: string }>;
      getTemplateLogs(): Promise<{ ok: boolean; logs?: TemplateLog[]; error?: string }>;
      // Records
      saveRecord(payload: {
        templateId: string;
        recordId: string;
        data: RecordData;
        user: string;
      }): Promise<{ ok: boolean; filePath?: string; error?: string }>;
      listDocuments(templateId: string): Promise<DocumentSummary[]>;
      getRecordVersion(
        recordId: string,
        templateId: string,
        version: number
      ): Promise<{ ok: boolean; data?: RecordVersionPayload; error?: string }>;
      openRecordFolder: (recordId: string, templateId: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
      generatePdf(
        payload: GeneratePdfInput
      ): Promise<{ ok: boolean; path?: string; error?: string }>;
      listVersions(
        recordId: string,
        templateId: string
      ): Promise<{ ok: boolean; versions?: RecordVersionInfo[]; error?: string }>;
      getVersionData(
        recordId: string,
        templateId: string,
        version: number
      ): Promise<{ ok: boolean; data?: RecordVersionPayload; error?: string }>;
      listPdfExports(
        recordId: string,
        templateId: string
      ): Promise<{ ok: boolean; logs?: PdfExportLog[]; error?: string }>;
      getDashboardStats(): Promise<{ ok: boolean; stats?: DashboardStats; error?: string }>;
      openPdfFile(filePath: string): Promise<{ ok: boolean; error?: string }>;
      exportJsonBackup(templateId: string): Promise<{ ok: boolean; path?: string; count?: number; error?: string }>;
      exportCsv(templateId: string): Promise<{ ok: boolean; path?: string; count?: number; error?: string }>;
      importJsonBackup(templateId: string, merge: boolean): Promise<{ ok: boolean; imported?: number; skipped?: number; errors?: string[]; error?: string }>;
      listUsers(): Promise<{ ok: boolean; users?: User[]; error?: string }>;
      createUser(user: { username: string; full_name: string; department: string; role: string }): Promise<{ ok: boolean; user?: User; error?: string }>;
      updateUser(user: { id: number; full_name?: string; department?: string; role?: string }): Promise<{ ok: boolean; user?: User; error?: string }>;
      deleteUser(userId: number): Promise<{ ok: boolean; error?: string }>;
      updateLastLogin(username: string): Promise<{ ok: boolean; error?: string }>;
      // Settings (設定)
      getConfig(): Promise<{ dataPath: string | null }>;
      saveConfig(config: { dataPath: string | null }): Promise<{ ok: boolean; error?: string }>;
      getDataPath(): Promise<string>;
      selectDataFolder(): Promise<{ ok: boolean; path?: string; canceled?: boolean; error?: string }>;
      resetDataPath(): Promise<{ ok: boolean; error?: string }>;
    };
  }
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  department: string;
  role: string;
  created_at: string;
  last_login?: string;
  is_active: number;
}

export { };
