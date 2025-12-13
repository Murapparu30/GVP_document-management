import { useState, useEffect } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';

interface DiffViewProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  templateId: string;
  versionA: number;
  versionB: number;
}

interface FieldDiff {
  fieldId: string;
  label: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}

export function DiffView({
  isOpen,
  onClose,
  recordId,
  templateId,
  versionA,
  versionB
}: DiffViewProps) {
  const [diffs, setDiffs] = useState<FieldDiff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_template, setTemplate] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadAndCompare();
    }
  }, [isOpen, recordId, templateId, versionA, versionB]);

  const loadAndCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      const templateData = await window.electronAPI.getTemplate(templateId);
      setTemplate(templateData);

      const [resultA, resultB] = await Promise.all([
        window.electronAPI.getVersionData(recordId, templateId, versionA),
        window.electronAPI.getVersionData(recordId, templateId, versionB)
      ]);

      if (!resultA.ok) {
        setError(`Version ${versionA} の読み込みに失敗しました: ${resultA.error}`);
        return;
      }

      if (!resultB.ok) {
        setError(`Version ${versionB} の読み込みに失敗しました: ${resultB.error}`);
        return;
      }

      const dataA = resultA.data?.data || {};
      const dataB = resultB.data?.data || {};

      const fieldMap = new Map();
      templateData.fields.forEach((field: any) => {
        fieldMap.set(field.id, field.label);
      });

      const allFieldIds = new Set([
        ...Object.keys(dataA),
        ...Object.keys(dataB)
      ]);

      const diffResults: FieldDiff[] = [];
      allFieldIds.forEach((fieldId) => {
        const oldValue = dataA[fieldId];
        const newValue = dataB[fieldId];
        const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);

        diffResults.push({
          fieldId,
          label: fieldMap.get(fieldId) || fieldId,
          oldValue,
          newValue,
          changed
        });
      });

      diffResults.sort((a, b) => {
        if (a.changed && !b.changed) return -1;
        if (!a.changed && b.changed) return 1;
        return a.label.localeCompare(b.label);
      });

      setDiffs(diffResults);
    } catch (err) {
      setError('差分の計算中にエラーが発生しました');
      console.error('Failed to compare versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(空)';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const changedCount = diffs.filter(d => d.changed).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">バージョン差分表示</h2>
            <p className="text-sm text-gray-600 mt-1">
              Version {versionA} → Version {versionB}
              {changedCount > 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  ({changedCount} 件の変更)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8 text-gray-500">差分を計算中...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!loading && !error && diffs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              比較可能なフィールドがありません
            </div>
          )}

          {!loading && !error && changedCount === 0 && diffs.length > 0 && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              2つのバージョン間に差異はありません
            </div>
          )}

          {!loading && !error && diffs.length > 0 && (
            <div className="space-y-4">
              {diffs.map((diff, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${diff.changed
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-gray-900">{diff.label}</h3>
                    {diff.changed && (
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-medium rounded">
                        変更あり
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Version {versionA}
                      </div>
                      <div className={`p-3 rounded border ${diff.changed
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200'
                        }`}>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                          {formatValue(diff.oldValue)}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <ArrowRight size={12} />
                        Version {versionB}
                      </div>
                      <div className={`p-3 rounded border ${diff.changed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                        }`}>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                          {formatValue(diff.newValue)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
