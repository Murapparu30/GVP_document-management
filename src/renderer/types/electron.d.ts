interface SaveRecordInput {
  templateId: string;
  recordId: string;
  data: any;
  user: string;
}

interface SaveRecordResult {
  ok: boolean;
  filePath: string;
}

interface RecordVersionInfo {
  id: number;
  version: number;
  file_path: string;
  created_at: string;
  created_by: string;
}

interface ListVersionsResult {
  ok: boolean;
  versions?: RecordVersionInfo[];
  error?: string;
}

interface GetVersionDataResult {
  ok: boolean;
  data?: any;
  error?: string;
}

interface PdfExportLog {
  id: number;
  document_id: number;
  version: number;
  file_path: string;
  exported_at: string;
  exported_by: string;
  purpose: string | null;
}

interface ListPdfExportsResult {
  ok: boolean;
  logs?: PdfExportLog[];
  error?: string;
}

interface DashboardStats {
  complaint: {
    total: number;
    byStatus: { status: string; count: number }[];
    openCount: number;
    lastUpdatedAt: string | null;
  };
  corrective: {
    total: number;
    byStatus: { status: string; count: number }[];
    openCount: number;
    overdueCount: number;
    dueSoonCount: number;
  };
}

interface GetDashboardStatsResult {
  ok: boolean;
  stats?: DashboardStats;
  error?: string;
}

interface ElectronAPI {
  getTemplate: (templateId: string) => Promise<any>;
  saveRecord: (input: SaveRecordInput) => Promise<SaveRecordResult>;
  listDocuments: (templateId: string) => Promise<any>;
  getRecordVersion: (recordId: string, templateId: string, version: number) => Promise<any>;
  generatePdf: (payload: any) => Promise<any>;
  listVersions: (recordId: string, templateId: string) => Promise<ListVersionsResult>;
  getVersionData: (recordId: string, templateId: string, version: number) => Promise<GetVersionDataResult>;
  listPdfExports: (recordId: string, templateId: string) => Promise<ListPdfExportsResult>;
  getDashboardStats: () => Promise<GetDashboardStatsResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { };
