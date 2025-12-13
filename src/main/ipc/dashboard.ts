import { ipcMain } from 'electron';
import { dbWrapperPromise } from '../db/index';

type RecentRecord = {
  record_id: string;
  title: string;
  status: string | null;
  updated_at: string;
};

type DashboardStats = {
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
};

ipcMain.handle('getDashboardStats', async (): Promise<{ ok: boolean; stats?: DashboardStats; error?: string }> => {
  try {
    const db = await dbWrapperPromise;
    const complaintTotal = db
      .prepare("SELECT COUNT(*) as cnt FROM documents WHERE template_id = 'complaint_record_v1'")
      .get() as { cnt: number };

    const complaintByStatus = db
      .prepare(
        `SELECT COALESCE(status, '（未設定）') as status, COUNT(*) as count
         FROM documents
         WHERE template_id = 'complaint_record_v1'
         GROUP BY COALESCE(status, '（未設定）')`
      )
      .all() as { status: string; count: number }[];

    const complaintOpenCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'complaint_record_v1'
           AND status NOT IN ('完了')`
      )
      .get() as { cnt: number };

    const lastComplaintUpdated = db
      .prepare(
        `SELECT updated_at
         FROM documents
         WHERE template_id = 'complaint_record_v1'
         ORDER BY updated_at DESC
         LIMIT 1`
      )
      .get() as { updated_at?: string } | undefined;

    const correctiveTotal = db
      .prepare("SELECT COUNT(*) as cnt FROM documents WHERE template_id = 'corrective_action_v1'")
      .get() as { cnt: number };

    const correctiveByStatus = db
      .prepare(
        `SELECT COALESCE(status, '（未設定）') as status, COUNT(*) as count
         FROM documents
         WHERE template_id = 'corrective_action_v1'
         GROUP BY COALESCE(status, '（未設定）')`
      )
      .all() as { status: string; count: number }[];

    const correctiveOpenCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'corrective_action_v1'
           AND status NOT IN ('クローズ')`
      )
      .get() as { cnt: number };

    const today = new Date();
    const yyyyMMdd = today.toISOString().slice(0, 10);

    const overdueCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'corrective_action_v1'
           AND status NOT IN ('クローズ')
           AND due_date IS NOT NULL
           AND due_date < ?`
      )
      .get(yyyyMMdd) as { cnt: number };

    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const dueSoonCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'corrective_action_v1'
           AND status NOT IN ('クローズ')
           AND due_date IS NOT NULL
           AND due_date >= ?
           AND due_date <= ?`
      )
      .get(yyyyMMdd, sevenDaysLater) as { cnt: number };

    // Recent complaint records (last 5)
    const recentComplaints = db
      .prepare(
        `SELECT record_id, title, status, updated_at
         FROM documents
         WHERE template_id = 'complaint_record_v1'
         ORDER BY updated_at DESC
         LIMIT 5`
      )
      .all() as RecentRecord[];

    // Recent corrective action records (last 5)
    const recentCorrectives = db
      .prepare(
        `SELECT record_id, title, status, updated_at
         FROM documents
         WHERE template_id = 'corrective_action_v1'
         ORDER BY updated_at DESC
         LIMIT 5`
      )
      .all() as RecentRecord[];

    // Completed counts
    const complaintCompletedCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'complaint_record_v1'
           AND status = '完了'`
      )
      .get() as { cnt: number };

    const correctiveCompletedCount = db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM documents
         WHERE template_id = 'corrective_action_v1'
           AND status IN ('クローズ', '完了')`
      )
      .get() as { cnt: number };

    // Last updated for corrective
    const lastCorrectiveUpdated = db
      .prepare(
        `SELECT updated_at
         FROM documents
         WHERE template_id = 'corrective_action_v1'
         ORDER BY updated_at DESC
         LIMIT 1`
      )
      .get() as { updated_at?: string } | undefined;

    // Calculate completion rates
    const complaintCompletionRate = complaintTotal.cnt > 0
      ? Math.round((complaintCompletedCount.cnt / complaintTotal.cnt) * 100)
      : 0;
    const correctiveCompletionRate = correctiveTotal.cnt > 0
      ? Math.round((correctiveCompletedCount.cnt / correctiveTotal.cnt) * 100)
      : 0;

    const stats: DashboardStats = {
      complaint: {
        total: complaintTotal.cnt,
        byStatus: complaintByStatus,
        openCount: complaintOpenCount.cnt,
        completedCount: complaintCompletedCount.cnt,
        completionRate: complaintCompletionRate,
        lastUpdatedAt: lastComplaintUpdated?.updated_at || null,
        recent: recentComplaints
      },
      corrective: {
        total: correctiveTotal.cnt,
        byStatus: correctiveByStatus,
        openCount: correctiveOpenCount.cnt,
        completedCount: correctiveCompletedCount.cnt,
        completionRate: correctiveCompletionRate,
        overdueCount: overdueCount.cnt,
        dueSoonCount: dueSoonCount.cnt,
        lastUpdatedAt: lastCorrectiveUpdated?.updated_at || null,
        recent: recentCorrectives
      },
      lastRefreshedAt: new Date().toISOString()
    };

    return { ok: true, stats };
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[getDashboardStats] error', error);
    return { ok: false, error: error.message || 'unknown error' };
  }
});

export type { DashboardStats };
