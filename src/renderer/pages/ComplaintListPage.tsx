import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, X, Download, FileJson, FileSpreadsheet, Upload, RefreshCw } from 'lucide-react';
import { DocumentSummary } from '../global';

interface ComplaintListPageProps {
  onSelectRecord: (recordId: string) => void;
  onCreateNew: () => void;
  onBackToDashboard?: () => void; // Added for breadcrumb navigation
  initialFilter?: { status?: string };
}

export function ComplaintListPage({ onSelectRecord, onCreateNew, onBackToDashboard, initialFilter }: ComplaintListPageProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchRecordId, setSearchRecordId] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter?.status || 'all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await window.electronAPI.listDocuments('complaint_record_v1');
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Record ID filter
      if (searchRecordId && !doc.record_id.toLowerCase().includes(searchRecordId.toLowerCase())) {
        return false;
      }

      // Product name filter
      if (searchProductName && !doc.product_name?.toLowerCase().includes(searchProductName.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === '未完了') {
          if (doc.status === '完了') return false;
        } else if (doc.status !== filterStatus) {
          return false;
        }
      }

      // Date range filter
      if (filterDateFrom && doc.complaint_date) {
        const docDate = new Date(doc.complaint_date);
        const fromDate = new Date(filterDateFrom);
        if (docDate < fromDate) return false;
      }

      if (filterDateTo && doc.complaint_date) {
        const docDate = new Date(doc.complaint_date);
        const toDate = new Date(filterDateTo);
        if (docDate > toDate) return false;
      }

      return true;
    });
  }, [documents, searchRecordId, searchProductName, filterStatus, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearchRecordId('');
    setSearchProductName('');
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = searchRecordId || searchProductName || filterStatus !== 'all' || filterDateFrom || filterDateTo;

  const handleExportJson = async () => {
    const result = await window.electronAPI.exportJsonBackup('complaint_record_v1');
    if (result.ok) {
      alert(`JSONバックアップを保存しました：${result.count} 件\n${result.path} `);
    } else {
      alert(`エクスポートに失敗しました：${result.error} `);
    }
  };

  const handleExportCsv = async () => {
    const result = await window.electronAPI.exportCsv('complaint_record_v1');
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

    const result = await window.electronAPI.importJsonBackup('complaint_record_v1', merge);
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
          <span className="text-gray-900 font-medium">苦情処理記録一覧</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">苦情対応一覧</h1>
              <button
                onClick={() => loadDocuments()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="更新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {filteredDocuments.length}件表示 {documents.length !== filteredDocuments.length && `(全${documents.length}件中)`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  clearFilters();
                  // clearFilters updates state, effect or re-render handles list.
                  // Wait, filters are client side. Just clearing state is enough.
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <RefreshCw size={14} />
                全件表示に戻す
              </button>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Record ID Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">苦情番号</label>
              <input
                type="text"
                value={searchRecordId}
                onChange={(e) => setSearchRecordId(e.target.value)}
                placeholder="CR-2025-0001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Product Name Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">製品名</label>
              <input
                type="text"
                value={searchProductName}
                onChange={(e) => setSearchProductName(e.target.value)}
                placeholder="製品名で検索"
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
                <option value="未完了">未完了 (完了以外)</option>
                <option value="受付中">受付中</option>
                <option value="調査中">調査中</option>
                <option value="対応中">対応中</option>
                <option value="完了">完了</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">受付日(開始)</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">受付日(終了)</label>
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
            <p className="text-gray-500 mb-4">苦情記録がありません</p>
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
                    苦情番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    製品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    受付日
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
                      {doc.product_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {doc.status ? (
                        <span
                          className={`px - 2 py - 1 rounded - full text - xs font - medium ${doc.status === '完了'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === '対応中'
                              ? 'bg-orange-100 text-orange-800'
                              : doc.status === '調査中'
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.complaint_date ? new Date(doc.complaint_date).toLocaleDateString('ja-JP') : '-'}
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
