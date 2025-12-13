import { useState, useEffect } from 'react';
import { X, Clock, User, FileText, GitCompare } from 'lucide-react';

interface RecordVersionInfo {
  id: number;
  version: number;
  file_path: string;
  status?: string;
  created_at: string;
  created_by: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  templateId: string;
  currentVersion: number;
  onViewVersion: (version: number) => void;
  onCompareVersions: (versionA: number, versionB: number) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  recordId,
  templateId,
  currentVersion,
  onViewVersion,
  onCompareVersions
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<RecordVersionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, recordId, templateId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.listVersions(recordId, templateId);
      if (result.ok && result.versions) {
        setVersions(result.versions.reverse());
      } else {
        setError(result.error || 'バージョン履歴の取得に失敗しました');
      }
    } catch (err) {
      setError('バージョン履歴の取得中にエラーが発生しました');
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: number) => {
    if (selectedForCompare.includes(version)) {
      setSelectedForCompare(selectedForCompare.filter(v => v !== version));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, version]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      const [v1, v2] = selectedForCompare.sort((a, b) => a - b);
      onCompareVersions(v1, v2);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">バージョン履歴</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              バージョン履歴がありません
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div className="space-y-3">
              {versions.map((v) => (
                <div
                  key={v.version}
                  className={`border rounded-lg p-4 transition-all ${selectedForCompare.includes(v.version)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    } ${v.version === currentVersion
                      ? 'ring-2 ring-green-500'
                      : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          Version {v.version}
                        </span>
                        {v.version === currentVersion && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            現在の版
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs border ${v.status === '完了' || v.status === 'クローズ' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            v.status ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                            {v.status || 'ステータスなし'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatDate(v.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{v.created_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          <span className="text-xs text-gray-500 truncate">
                            {v.file_path}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onViewVersion(v.version)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                      >
                        表示
                      </button>
                      <button
                        onClick={() => handleVersionSelect(v.version)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${selectedForCompare.includes(v.version)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {selectedForCompare.includes(v.version) ? '選択中' : '比較'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedForCompare.length === 2 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <GitCompare size={18} />
                <span>
                  Version {Math.min(...selectedForCompare)} と Version {Math.max(...selectedForCompare)} を比較
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <GitCompare size={18} />
                  差分を表示
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
