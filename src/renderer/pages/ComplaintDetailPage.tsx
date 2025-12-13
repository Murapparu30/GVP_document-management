import React, { useEffect, useState } from 'react';
import { FileDown, History, ChevronDown, ChevronUp, ClipboardCheck, Plus, RefreshCw, FolderOpen } from 'lucide-react';
import { DynamicForm } from '../components/forms/DynamicForm';
import { VersionHistoryModal } from '../components/VersionHistoryModal';
import { DiffView } from '../components/DiffView';
import { RecordHistoryPanel } from '../components/history/RecordHistoryPanel';
import { RecordDiffView } from '../components/history/RecordDiffView';
import { PdfExportHistoryPanel } from '../components/history/PdfExportHistoryPanel';
import type { TemplateDefinition } from '../types/template';
import type { RecordData } from '../types/record';
import type { DocumentSummary } from '../global';

const currentUserName = '品質保証部 山田';

interface ComplaintDetailPageProps {
  recordId?: string;
  onBack?: () => void;
  onBackToDashboard?: () => void;
  onNavigateToCorrectiveAction?: (recordId: string | null) => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({ recordId, onBack, onBackToDashboard, onNavigateToCorrectiveAction }) => {
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
  const [relatedCorrectiveActions, setRelatedCorrectiveActions] = useState<DocumentSummary[]>([]);

  useEffect(() => {
    loadData();
  }, [recordId]);

  // Load related corrective actions
  useEffect(() => {
    if (!recordId) return;

    const loadRelatedCorrectiveActions = async () => {
      try {
        const allCorrectiveActions = await window.electronAPI.listDocuments('corrective_action_v1');
        const related = allCorrectiveActions.filter(
          (doc) => doc.source_record_id === recordId
        );
        setRelatedCorrectiveActions(related);
      } catch (err) {
        console.error('Failed to load related corrective actions:', err);
      }
    };

    loadRelatedCorrectiveActions();
  }, [recordId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const t = await window.electronAPI.getTemplate('complaint_record_v1');
      setTemplate(t);

      if (recordId) {
        const docs = await window.electronAPI.listDocuments('complaint_record_v1');
        const doc = docs.find(d => d.record_id === recordId);

        if (doc) {
          const result = await window.electronAPI.getRecordVersion(
            recordId,
            'complaint_record_v1',
            doc.latest_version
          );
          if (result.ok && result.data) {
            setFormData(result.data.data);
            setCurrentVersion(result.data.meta.version);
          } else {
            throw new Error(result.error || 'Failed to load record');
          }
        } else {
          setFormData({});
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

    const saveRecordId = recordId || formData.complaint_id || 'TEMP-0001';

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

  const handleOpenOrCreateCorrective = async () => {
    if (!template || !formData.complaint_id) {
      alert('苦情記録を先に保存してください');
      return;
    }

    let caId = formData.linked_corrective_id as string | undefined;

    if (!caId) {
      caId = `CA-${formData.complaint_id}`;

      setFormData((prev) => ({
        ...prev,
        linked_corrective_id: caId
      }));

      const saveRecordId = recordId || formData.complaint_id as string;
      await window.electronAPI.saveRecord({
        templateId: template.template_id,
        recordId: saveRecordId,
        data: { ...formData, linked_corrective_id: caId },
        user: currentUserName
      });
    }

    if (onNavigateToCorrectiveAction) {
      onNavigateToCorrectiveAction(caId);
    }
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
            苦情処理記録一覧
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
        <DynamicForm template={template} value={formData} onChange={setFormData} />

        {/* 関連是正処置記録セクション */}
        {formData.complaint_id && onNavigateToCorrectiveAction && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">関連是正処置記録</h3>
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                  {relatedCorrectiveActions.length}件
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenOrCreateCorrective}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus size={16} />
                新規作成
              </button>
            </div>

            {relatedCorrectiveActions.length === 0 ? (
              <p className="text-sm text-gray-600">まだ是正処置記録が作成されていません</p>
            ) : (
              <div className="space-y-2">
                {relatedCorrectiveActions.map((ca) => {
                  // Calculate due status
                  const getDueStatus = () => {
                    if (!ca.due_date) return 'normal';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dueDate = new Date(ca.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) return 'overdue';
                    if (diffDays <= 7) return 'soon';
                    return 'normal';
                  };

                  const dueStatus = getDueStatus();

                  return (
                    <div
                      key={ca.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{ca.record_id}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${ca.status === 'クローズ'
                              ? 'bg-green-100 text-green-800'
                              : ca.status === '確認中'
                                ? 'bg-orange-100 text-orange-800'
                                : ca.status === '実施中'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            {ca.status || '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>
                            実施期限: {ca.due_date ? new Date(ca.due_date).toLocaleDateString('ja-JP') : '-'}
                          </span>
                          {dueStatus === 'overdue' && (
                            <span className="text-red-600 font-medium">⚠️ 期限超過</span>
                          )}
                          {dueStatus === 'soon' && (
                            <span className="text-yellow-600 font-medium">⏰ 期限間近</span>
                          )}
                          <span>
                            更新: {new Date(ca.updated_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateToCorrectiveAction(ca.record_id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        詳細
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
              className="mb-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
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
