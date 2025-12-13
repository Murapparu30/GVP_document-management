import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, X, AlertTriangle, Clock, Download, FileJson, FileSpreadsheet, Upload, RefreshCw } from 'lucide-react';
import { DocumentSummary } from '../global';

interface CorrectiveActionListPageProps {
  onSelectRecord: (recordId: string) => void;
  onCreateNew: () => void;
  onBackToDashboard?: () => void; // Added for breadcrumb navigation
  initialFilter?: { status?: string; overdue?: boolean; dueSoon?: boolean };
}

export function CorrectiveActionListPage({ onSelectRecord, onCreateNew, onBackToDashboard, initialFilter }: CorrectiveActionListPageProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchRecordId, setSearchRecordId] = useState('');
  const [searchSourceId, setSearchSourceId] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter?.status || 'all');
  const [filterDueStatus, setFilterDueStatus] = useState<string>(
    initialFilter?.overdue ? 'overdue' : initialFilter?.dueSoon ? 'soon' : 'all'
  );
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await window.electronAPI.listDocuments('corrective_action_v1');
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate due status
  const getDueStatus = (dueDate: string | undefined): 'overdue' | 'soon' | 'normal' => {
    if (!dueDate) return 'normal';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'soon';
    return 'normal';
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Record ID filter
      if (searchRecordId && !doc.record_id.toLowerCase().includes(searchRecordId.toLowerCase())) {
        return false;
      }

      // Source record ID filter
      if (searchSourceId && !doc.source_record_id?.toLowerCase().includes(searchSourceId.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === '未完了') {
          if (doc.status === 'クローズ' || doc.status === '完了') return false;
        } else if (doc.status !== filterStatus) {
          return false;
        }
      }

      // Due status filter
      if (filterDueStatus !== 'all') {
        const dueStatus = getDueStatus(doc.due_date);
        if (filterDueStatus !== dueStatus) {
          return false;
        }
      }

      // Date range filter
      if (filterDateFrom && doc.due_date) {
        const docDate = new Date(doc.due_date);
        const fromDate = new Date(filterDateFrom);
        if (docDate < fromDate) return false;
      }

      if (filterDateTo && doc.due_date) {
        const docDate = new Date(doc.due_date);
        const toDate = new Date(filterDateTo);
        if (docDate > toDate) return false;
      }

      return true;
    });
  }, [documents, searchRecordId, searchSourceId, filterStatus, filterDueStatus, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearchRecordId('');
    setSearchSourceId('');
    setFilterStatus('all');
    setFilterDueStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = searchRecordId || searchSourceId || filterStatus !== 'all' || filterDueStatus !== 'all' || filterDateFrom || filterDateTo;

  // Count overdue and due soon
  const overdueCount = filteredDocuments.filter(doc => getDueStatus(doc.due_date) === 'overdue').length;
  const dueSoonCount = filteredDocuments.filter(doc => getDueStatus(doc.due_date) === 'soon').length;

  const handleExportJson = async () => {
    const result = await window.electronAPI.exportJsonBackup('corrective_action_v1');
    if (result.ok) {
      alert(`JSONバックアップを保存しました：${result.count} 件\n${result.path} `);
    } else {
      alert(`エクスポートに失敗しました：${result.error} `);
    }
  };

  const handleExportCsv = async () => {
    const result = await window.electronAPI.exportCsv('corrective_action_v1');
    if (result.ok) {
      alert(`CSVをエクスポートしました：${result.count} 件\n${result.path} `);
    } else {
      alert(`エクスポートに失敗しました：${result.error} `);
    }
  };

  const handleImportJson = async (merge: boolean) => {
    const confirmMsg = merge
      ? 'JSONバックアップをインポートします。既存データとマージしますか？\n\n※同じ記録IDの場合、新しいバージョンのみ追加されます。'
      : 'JSONバックアップをインポートします。既存データはスキップされます。\n\n※同じ記録IDは無視されます。';

    if (!confirm(confirmMsg)) return;

    const result = await window.electronAPI.importJsonBackup('corrective_action_v1', merge);
    if (result.ok) {
      let message = `インポート完了：\n - インポート: ${result.imported} 件\n - スキップ: ${result.skipped} 件`;
      if (result.errors && result.errors.length > 0) {
        message += `\n\nエラー: \n${result.errors.slice(0, 5).join('\n')} `;
        if (result.errors.length > 5) {
          message += `\n... 他 ${result.errors.length - 5} 件`;
        }
      }
      alert(message);
      loadDocuments(); // Reload the list
    } else {
      alert(`インポートに失敗しました：${result.error} `);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          <button
            onClick={onBackToDashboard}
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            ダッシュボード
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">是正処置記録一覧</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">是正処置一覧</h1>
              <button
                onClick={() => loadDocuments()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="更新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-sm text-gray-600">
                {filteredDocuments.length}件表示 {documents.length !== filteredDocuments.length && `(全${documents.length}件中)`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  全件表示に戻す
                </button>
              )}
              {overdueCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  <AlertTriangle size={12} />
                  期限超過: {overdueCount}件
                </span>
              )}
              {dueSoonCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  <Clock size={12} />
                  期限間近: {dueSoonCount}件
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Import Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload size={18} />
                インポート
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleImportJson(false)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <FileJson size={16} />
                  <div>
                    <div className="font-medium">新規のみ</div>
                    <div className="text-xs text-gray-500">既存データをスキップ</div>
                  </div>
                </button>
                <button
                  onClick={() => handleImportJson(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileJson size={16} />
                  <div>
                    <div className="font-medium">マージ</div>
                    <div className="text-xs text-gray-500">既存データと統合</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download size={18} />
                エクスポート
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <FileJson size={16} />
                  JSONバックアップ
                </button>
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <FileSpreadsheet size={16} />
                  CSVエクスポート
                </button>
              </div>
            </div>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              新規作成
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">検索・フィルター</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={14} />
                クリア
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Record ID Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">是正処置番号</label>
              <input
                type="text"
                value={searchRecordId}
                onChange={(e) => setSearchRecordId(e.target.value)}
                placeholder="CA-CR-2025-0001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Source Record ID Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">発端記録</label>
              <input
                type="text"
                value={searchSourceId}
                onChange={(e) => setSearchSourceId(e.target.value)}
                placeholder="CR-2025-0001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="未完了">未完了 (クローズ以外)</option>
                <option value="計画中">計画中</option>
                <option value="実施中">実施中</option>
                <option value="確認中">確認中</option>
                <option value="クローズ">クローズ</option>
              </select>
            </div>

            {/* Due Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">期限状態</label>
              <select
                value={filterDueStatus}
                onChange={(e) => setFilterDueStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="overdue">⚠️ 期限超過</option>
                <option value="soon">⏰ 期限間近(7日以内)</option>
                <option value="normal">通常</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">実施期限(開始)</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">実施期限(終了)</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {filteredDocuments.length === 0 && documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">是正処置記録がありません</p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              最初の記録を作成
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">検索条件に一致する記録がありません</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              フィルターをクリア
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    是正処置番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発端記録
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実施期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終更新
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.source_record_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {doc.status ? (
                        <span
                          className={`px - 2 py - 1 rounded - full text - xs font - medium ${doc.status === 'クローズ'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === '確認中'
                              ? 'bg-orange-100 text-orange-800'
                              : doc.status === '実施中'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            } `}
                        >
                          {doc.status}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {doc.due_date ? (
                        <span
                          className={(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dueDate = new Date(doc.due_date);
                            dueDate.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                            if (diffDays < 0) {
                              return 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
                            } else if (diffDays <= 7) {
                              return 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
                            } else {
                              return 'text-gray-500';
                            }
                          })()}
                        >
                          {new Date(doc.due_date).toLocaleDateString('ja-JP')}
                          {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dueDate = new Date(doc.due_date);
                            dueDate.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                            if (diffDays < 0) return ' ⚠️ 期限超過';
                            if (diffDays <= 7) return ' ⏰ 期限間近';
                            return '';
                          })()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.updated_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onSelectRecord(doc.record_id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
