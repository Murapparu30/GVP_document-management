import React, { useState, useEffect } from 'react';
import { AlertCircle, GitCompare } from 'lucide-react';

type RecordHistoryPanelProps = {
  recordId: string;
  templateId: string;
  onSelectForDiff: (version: number) => void;
};

interface RecordVersionInfo {
  id: number;
  version: number;
  file_path: string;
  created_at: string;
  created_by: string;
}

export const RecordHistoryPanel: React.FC<RecordHistoryPanelProps> = ({
  recordId,
  templateId,
  onSelectForDiff
}) => {
  const [versions, setVersions] = useState<RecordVersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [recordId, templateId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.listVersions(recordId, templateId);

      if (result.ok && result.versions) {
        setVersions(result.versions);
      } else {
        setError(result.error || 'バージョン履歴の取得に失敗しました');
      }
    } catch (err) {
      setError('バージョン履歴の読み込み中にエラーが発生しました');
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        バージョン履歴がありません
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">版履歴</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {versions.map((version) => (
              <tr key={version.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    v{version.version}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatDate(version.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {version.created_by}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onSelectForDiff(version.version)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    <GitCompare size={14} />
                    差分比較に追加
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
