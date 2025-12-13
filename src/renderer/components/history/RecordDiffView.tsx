import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeftRight, RotateCcw } from 'lucide-react';
import { TemplateDefinition } from '../../types/template';

type RecordDiffViewProps = {
  template: TemplateDefinition;
  recordId: string;
  templateId: string;
  leftVersion: number | null;
  rightVersion: number | null;
  onReset?: () => void;
};

interface VersionData {
  meta: {
    record_id: string;
    template_id: string;
    version: number;
    created_at: string;
    updated_at: string;
    updated_by: string;
  };
  data: Record<string, any>;
}

export const RecordDiffView: React.FC<RecordDiffViewProps> = ({
  template,
  recordId,
  templateId,
  leftVersion,
  rightVersion,
  onReset
}) => {
  const [leftData, setLeftData] = useState<VersionData | null>(null);
  const [rightData, setRightData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leftVersion !== null && rightVersion !== null) {
      loadVersionData();
    } else {
      setLeftData(null);
      setRightData(null);
      setError(null);
    }
  }, [leftVersion, rightVersion, recordId, templateId]);

  const loadVersionData = async () => {
    if (leftVersion === null || rightVersion === null) return;

    setLoading(true);
    setError(null);

    try {
      const [leftResult, rightResult] = await Promise.all([
        window.electronAPI.getRecordVersion(recordId, templateId, leftVersion),
        window.electronAPI.getRecordVersion(recordId, templateId, rightVersion)
      ]);

      if (!leftResult.ok || !leftResult.data) {
        setError(`v${leftVersion}のデータが見つかりません: ${leftResult.error || 'Unknown error'}`);
        return;
      }

      if (!rightResult.ok || !rightResult.data) {
        setError(`v${rightVersion}のデータが見つかりません: ${rightResult.error || 'Unknown error'}`);
        return;
      }

      setLeftData(leftResult.data);
      setRightData(rightResult.data);
    } catch (err) {
      setError('バージョンデータの読み込み中にエラーが発生しました');
      console.error('Failed to load version data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const valuesAreDifferent = (leftVal: any, rightVal: any): boolean => {
    const left = formatValue(leftVal);
    const right = formatValue(rightVal);
    return left !== right;
  };

  if (leftVersion === null || rightVersion === null) {
    return (
      <div className="p-6">
        <div className="mb-4 pb-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            比較対象: {leftVersion !== null ? `v${leftVersion}` : '-'} vs {rightVersion !== null ? `v${rightVersion}` : '-'}
          </p>
        </div>
        <div className="text-center text-gray-500">
          差分比較を行うには、2つのバージョンを選択してください
        </div>
      </div>
    );
  }

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

  if (!leftData || !rightData) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">差分表示</h3>
          <p className="text-sm text-gray-600">
            比較対象: v{leftVersion} vs v{rightVersion}
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <RotateCcw size={16} />
            比較リセット
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-sm">
          v{leftVersion}
        </span>
        <ArrowLeftRight size={16} className="text-gray-400" />
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-sm">
          v{rightVersion}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                項目
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                v{leftVersion}の値
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                v{rightVersion}の値
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                変更
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {template.fields.map((field) => {
              const leftValue = leftData.data[field.id];
              const rightValue = rightData.data[field.id];
              const isDifferent = valuesAreDifferent(leftValue, rightValue);

              return (
                <tr
                  key={field.id}
                  className={isDifferent ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {field.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {formatValue(leftValue) || <span className="text-gray-400 italic">（未入力）</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {formatValue(rightValue) || <span className="text-gray-400 italic">（未入力）</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isDifferent ? (
                      <span className="inline-block w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full text-xs leading-6 font-bold">
                        ★
                      </span>
                    ) : (
                      <span className="text-gray-400">ー</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>★ = 差分あり</p>
      </div>
    </div>
  );
};
