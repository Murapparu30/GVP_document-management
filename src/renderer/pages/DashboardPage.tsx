import { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Clock, CheckCircle, FileText, ClipboardCheck, ArrowRight, Plus, TrendingUp, Upload, Trash2 } from 'lucide-react';
import type { DashboardStats, TemplateSummary } from '../global';

type DashboardPageProps = {
  onOpenComplaints: (filter?: { status?: string }) => void;
  onOpenCorrectives: (filter?: { status?: string; overdue?: boolean; dueSoon?: boolean }) => void;
  onOpenComplaintDetail: (recordId: string) => void;
  onOpenCorrectiveDetail: (recordId: string) => void;
  onCreateComplaint: () => void;
  onCreateCorrective: () => void;
  onOpenCustomTemplate?: (templateId: string) => void;
};

export function DashboardPage({ onOpenComplaints, onOpenCorrectives, onOpenComplaintDetail, onOpenCorrectiveDetail, onCreateComplaint, onCreateCorrective, onOpenCustomTemplate }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadTemplates();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getDashboardStats();
      if (result.ok && result.stats) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to load dashboard stats');
      }
    } catch (e) {
      setError('Error loading dashboard stats');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const list = await window.electronAPI.listTemplates();
      setTemplates(list);
    } catch (e) {
      console.error('Error loading templates:', e);
    }
  };

  const handleImportTemplate = async () => {
    try {
      const result = await window.electronAPI.importTemplate('system');
      if (result.canceled) return;
      if (result.ok) {
        setImportMessage(`テンプレート「${result.template_name}」をインポートしました`);
        setTimeout(() => setImportMessage(null), 3000);
        loadTemplates();
      } else {
        setImportMessage(`エラー: ${result.error}`);
        setTimeout(() => setImportMessage(null), 5000);
      }
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('このテンプレートを削除しますか？削除ログは保存されます。')) return;
    try {
      const result = await window.electronAPI.deleteTemplate(templateId, 'system');
      if (result.ok) {
        setImportMessage('テンプレートを削除しました');
        setTimeout(() => setImportMessage(null), 3000);
        loadTemplates();
      } else {
        setImportMessage(`エラー: ${result.error}`);
        setTimeout(() => setImportMessage(null), 5000);
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">データがありません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import Message */}
        {importMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
            {importMessage}
          </div>
        )}

        {/* Header with Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 size={32} className="text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">管理ダッシュボード</h1>
              </div>
              <p className="text-gray-600">QMS記録の状況を一目で確認できます</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleImportTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Upload size={18} />
                テンプレートをインポート
              </button>
              <button
                onClick={onCreateComplaint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                苦情処理を作成
              </button>
              <button
                onClick={onCreateCorrective}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                是正処置を作成
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <TrendingUp size={16} />
              苦情処理 完了率
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.complaint.completionRate}%</div>
            <div className="text-xs text-gray-500">{stats.complaint.completedCount} / {stats.complaint.total} 件完了</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <TrendingUp size={16} />
              是正処置 完了率
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.corrective.completionRate}%</div>
            <div className="text-xs text-gray-500">{stats.corrective.completedCount} / {stats.corrective.total} 件完了</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <AlertTriangle size={16} />
              期限超過
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.corrective.overdueCount}</div>
            <div className="text-xs text-gray-500">要対応</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock size={16} />
              期限間近
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.corrective.dueSoonCount}</div>
            <div className="text-xs text-gray-500">7日以内</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Complaint Records Card with integrated record list */}
          <div className="bg-white rounded-lg shadow p-6">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
              onClick={() => onOpenComplaints({})}
              title="苦情処理記録一覧を開く"
            >
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">苦情処理記録</h2>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">総件数</div>
                <div className="text-2xl font-bold text-blue-600">{stats.complaint.total}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">未完了</div>
                <div className="text-2xl font-bold text-orange-600">{stats.complaint.openCount}</div>
              </div>
            </div>

            {/* Record list - click to go directly to detail */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">記録一覧（直近5件）</span>
                <button
                  onClick={() => onOpenComplaints({})}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  すべて表示 →
                </button>
              </div>
              {stats.complaint.recent.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                  記録がありません
                </div>
              ) : (
                <div className="space-y-1">
                  {stats.complaint.recent.map((record) => (
                    <div
                      key={record.record_id}
                      onClick={() => onOpenComplaintDetail(record.record_id)}
                      className="flex items-center justify-between p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors border border-transparent hover:border-blue-200 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-gray-900 truncate">{record.record_id}</span>
                        {record.status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${record.status === '完了' ? 'bg-green-100 text-green-800' :
                            record.status === '対応中' ? 'bg-orange-100 text-orange-800' :
                              record.status === '調査中' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {record.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(record.updated_at).toLocaleDateString('ja-JP')}</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Corrective Action Card with integrated record list */}
          <div className="bg-white rounded-lg shadow p-6">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
              onClick={() => onOpenCorrectives({})}
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">是正処置記録</h2>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">総件数</div>
                <div className="text-2xl font-bold text-green-600">{stats.corrective.total}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-600">未完了</div>
                <div className="text-2xl font-bold text-orange-600">{stats.corrective.openCount}</div>
              </div>
            </div>

            {/* Record list - click to go directly to detail */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">記録一覧（直近5件）</span>
                <button
                  onClick={() => onOpenCorrectives({})}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  すべて表示 →
                </button>
              </div>
              {stats.corrective.recent.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                  記録がありません
                </div>
              ) : (
                <div className="space-y-1">
                  {stats.corrective.recent.map((record) => (
                    <div
                      key={record.record_id}
                      onClick={() => onOpenCorrectiveDetail(record.record_id)}
                      className="flex items-center justify-between p-2 hover:bg-green-50 rounded cursor-pointer transition-colors border border-transparent hover:border-green-200 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-gray-900 truncate">{record.record_id}</span>
                        {record.status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${record.status === 'クローズ' ? 'bg-green-100 text-green-800' :
                            record.status === '確認中' ? 'bg-orange-100 text-orange-800' :
                              record.status === '実施中' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {record.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(record.updated_at).toLocaleDateString('ja-JP')}</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={24} className="text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">要注意項目</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`rounded-lg p-4 cursor-pointer transition-colors ${stats.corrective.overdueCount > 0 ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100' : 'bg-gray-50'}`}
              onClick={() => stats.corrective.overdueCount > 0 && onOpenCorrectives({ overdue: true })}
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={20} className={stats.corrective.overdueCount > 0 ? 'text-red-600' : 'text-gray-400'} />
                <h3 className="font-semibold text-gray-900">期限超過</h3>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.corrective.overdueCount}</div>
              <div className="text-sm text-gray-600">是正処置の期限が過ぎています</div>
            </div>

            <div
              className={`rounded-lg p-4 cursor-pointer transition-colors ${stats.corrective.dueSoonCount > 0 ? 'bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100' : 'bg-gray-50'}`}
              onClick={() => stats.corrective.dueSoonCount > 0 && onOpenCorrectives({ dueSoon: true })}
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className={stats.corrective.dueSoonCount > 0 ? 'text-yellow-600' : 'text-gray-400'} />
                <h3 className="font-semibold text-gray-900">期限間近（7日以内）</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.corrective.dueSoonCount}</div>
              <div className="text-sm text-gray-600">是正処置の期限が近づいています</div>
            </div>
          </div>

          {stats.corrective.overdueCount === 0 && stats.corrective.dueSoonCount === 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="font-semibold">すべての是正処置が期限内です</span>
            </div>
          )}
        </div>
        {/* Custom Templates Section */}
        {templates.filter(t => t.isCustom).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={24} />
              カスタムテンプレート
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.filter(t => t.isCustom).map(template => (
                <div
                  key={template.template_id}
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onOpenCustomTemplate?.(template.template_id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                      <p className="text-xs text-gray-400">バージョン: {template.version}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.template_id); }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="テンプレートを削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            最終更新: {new Date(stats.lastRefreshedAt).toLocaleString('ja-JP')}
          </div>
          <button
            onClick={loadStats}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            データを再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}
