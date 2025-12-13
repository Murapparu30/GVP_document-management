import React, { useEffect, useState } from 'react';
import { FileDown, History, ChevronDown, ChevronUp, FileText, RefreshCw, FolderOpen } from 'lucide-react';
import { DynamicForm } from '../components/forms/DynamicForm';
import { VersionHistoryModal } from '../components/VersionHistoryModal';
import { DiffView } from '../components/DiffView';
import { RecordHistoryPanel } from '../components/history/RecordHistoryPanel';
import { RecordDiffView } from '../components/history/RecordDiffView';
import { PdfExportHistoryPanel } from '../components/history/PdfExportHistoryPanel';
import type { TemplateDefinition } from '../types/template';
import type { RecordData } from '../types/record';

const currentUserName = '品質保証部 山田';

interface CorrectiveActionDetailPageProps {
  recordId?: string;
  onBack?: () => void;
  onBackToDashboard?: () => void;
  onNavigateToComplaint?: (recordId: string) => void;
}

export const CorrectiveActionDetailPage: React.FC<CorrectiveActionDetailPageProps> = ({ recordId, onBack, onBackToDashboard, onNavigateToComplaint }) => {
  const [template, setTemplate] = useState<TemplateDefinition | null>(null);
  const [formData, setFormData] = useState<RecordData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ versionA: number; versionB: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [leftVersion, setLeftVersion] = useState<number | null>(null);
  const [rightVersion, setRightVersion] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [recordId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const t = await window.electronAPI.getTemplate('corrective_action_v1');
      setTemplate(t);

      if (recordId) {
        const docs = await window.electronAPI.listDocuments('corrective_action_v1');
        const doc = docs.find(d => d.record_id === recordId);

        if (doc) {
          const result = await window.electronAPI.getRecordVersion(
            recordId,
            'corrective_action_v1',
            doc.latest_version
          );
          if (result.ok && result.data) {
            setFormData(result.data.data);
            setCurrentVersion(result.data.meta.version);
          } else {
            throw new Error(result.error || 'Failed to load record');
          }
        } else {
          if (recordId.startsWith('CA-CR-')) {
            const complaintId = recordId.replace('CA-', '');
            setFormData({
              ca_id: recordId,
              source_record_type: '苦情',
              source_record_id: complaintId,
              related_complaint_id: complaintId
            });
          } else {
            setFormData({ ca_id: recordId });
          }
        }
      } else {
        setFormData({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    // Validate form before saving
    const validateForm = (window as any).validateForm;
    if (validateForm && !validateForm()) {
      alert('入力内容に誤りがあります。赤色で表示されているフィールドを確認してください。');
      return;
    }

    const saveRecordId = recordId || formData.ca_id || 'CA-2025-0001';

    const res = await window.electronAPI.saveRecord({
      templateId: template.template_id,
      recordId: saveRecordId,
      data: formData,
      user: currentUserName
    });

    if (res.ok) {
      alert('保存しました: ' + res.filePath);
      if (onBack) {
        onBack();
      }
    } else {
      alert('保存に失敗しました: ' + res.error);
    }
  };

  const handleExportPdf = async () => {
    if (!template || !recordId) {
      alert('記録を先に保存してください');
      return;
    }

    const res = await window.electronAPI.generatePdf({
      recordId,
      templateId: template.template_id,
      version: currentVersion,
      exportedBy: currentUserName,
      purpose: 'ユーザー出力'
    });

    if (res.ok) {
      alert('PDFを出力しました: ' + res.path);
    } else {
      alert('PDF出力に失敗しました: ' + res.error);
    }
  };

  const handleViewVersion = async (version: number) => {
    if (!template || !recordId) return;

    try {
      const result = await window.electronAPI.getRecordVersion(
        recordId,
        template.template_id,
        version
      );
      if (result.ok && result.data) {
        setFormData(result.data.data);
        setCurrentVersion(result.data.meta.version);
        setShowVersionHistory(false);
      } else {
        alert('バージョンの読み込みに失敗しました: ' + result.error);
      }
    } catch (err) {
      alert('バージョンの読み込みに失敗しました: ' + err);
    }
  };

  const handleCompareVersions = (versionA: number, versionB: number) => {
    setDiffVersions({ versionA, versionB });
    setShowDiff(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">エラー: {error}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 一覧に戻る
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">テンプレートが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-4">
        <nav className="flex items-center text-sm text-gray-500">
          <button
            onClick={onBackToDashboard}
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            ダッシュボード
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={onBack}
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            是正処置記録一覧
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">
            {recordId ? recordId : '新規作成'}
          </span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{template.template_name}</h2>
            {recordId && (
              <p className="text-sm text-gray-600 mt-1">
                {recordId} (v{currentVersion})
              </p>
            )}
          </div>
          <button
            onClick={() => loadData()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="更新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* 関連苦情へのナビゲーション */}
        {formData.related_complaint_id && onNavigateToComplaint && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">関連苦情記録</p>
                <p className="text-lg font-semibold text-blue-600">{formData.related_complaint_id}</p>
              </div>
              <button
                onClick={() => onNavigateToComplaint(formData.related_complaint_id as string)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText size={18} />
                苦情詳細を表示
              </button>
            </div>
          </div>
        )}

        <DynamicForm template={template} value={formData} onChange={setFormData} />
        <div className="mt-8 flex justify-end gap-3">
          {recordId && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await window.electronAPI.openRecordFolder(recordId, template.template_id);
                    if (!result.ok) alert(result.error);
                  } catch (e) { alert(String(e)); }
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                title="フォルダを開く"
              >
                <FolderOpen size={18} />
                フォルダ
              </button>
              <button
                type="button"
                onClick={() => setShowVersionHistory(true)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <History size={18} />
                版履歴
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileDown size={18} />
                PDF出力
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      {recordId && template && (
        <>
          <div className="max-w-7xl mx-auto mt-6">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  setLeftVersion(null);
                  setRightVersion(null);
                }
              }}
              className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              {showHistory ? (
                <>
                  <ChevronUp size={20} />
                  履歴を閉じる
                </>
              ) : (
                <>
                  <ChevronDown size={20} />
                  履歴・差分を表示
                </>
              )}
            </button>

            {showHistory && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="flex-1 border-r border-gray-200 pr-4">
                    <RecordHistoryPanel
                      recordId={recordId}
                      templateId={template.template_id}
                      onSelectForDiff={(v) => {
                        if (leftVersion === null) {
                          setLeftVersion(v);
                        } else if (rightVersion === null) {
                          setRightVersion(v);
                        } else {
                          setLeftVersion(v);
                          setRightVersion(null);
                        }
                      }}
                    />
                    {(leftVersion !== null || rightVersion !== null) && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800 font-medium mb-2">選択中のバージョン:</p>
                        <div className="flex gap-2 text-sm">
                          {leftVersion !== null && (
                            <span className="px-2 py-1 bg-blue-600 text-white rounded">
                              左: v{leftVersion}
                            </span>
                          )}
                          {rightVersion !== null && (
                            <span className="px-2 py-1 bg-blue-600 text-white rounded">
                              右: v{rightVersion}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setLeftVersion(null);
                            setRightVersion(null);
                          }}
                          className="mt-2 text-xs text-blue-700 hover:text-blue-900 underline"
                        >
                          選択をリセット
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-[2]">
                    <RecordDiffView
                      template={template}
                      recordId={recordId}
                      templateId={template.template_id}
                      leftVersion={leftVersion}
                      rightVersion={rightVersion}
                      onReset={() => {
                        setLeftVersion(null);
                        setRightVersion(null);
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <PdfExportHistoryPanel
                    recordId={recordId}
                    templateId={template.template_id}
                  />
                </div>
              </div>
            )}
          </div>

          <VersionHistoryModal
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            recordId={recordId}
            templateId={template.template_id}
            currentVersion={currentVersion}
            onViewVersion={handleViewVersion}
            onCompareVersions={handleCompareVersions}
          />

          {diffVersions && (
            <DiffView
              isOpen={showDiff}
              onClose={() => {
                setShowDiff(false);
                setDiffVersions(null);
              }}
              recordId={recordId}
              templateId={template.template_id}
              versionA={diffVersions.versionA}
              versionB={diffVersions.versionB}
            />
          )}
        </>
      )}
    </div>
  );
};
