import React, { useEffect, useState } from 'react';
import { FileDown, History, Plus, ArrowLeft, RefreshCw, FolderOpen, FileText } from 'lucide-react';
import { DynamicForm } from '../components/forms/DynamicForm';
import { VersionHistoryModal } from '../components/VersionHistoryModal';
import type { TemplateDefinition } from '../types/template';
import type { RecordData } from '../types/record';
import type { DocumentSummary } from '../global';

interface CustomTemplateRecordPageProps {
    templateId: string;
    recordId?: string | null;
    onBack?: () => void;
    onBackToDashboard?: () => void;
}

export const CustomTemplateRecordPage: React.FC<CustomTemplateRecordPageProps> = ({
    templateId,
    recordId: initialRecordId,
    onBack,
    onBackToDashboard
}) => {
    const [template, setTemplate] = useState<TemplateDefinition | null>(null);
    const [formData, setFormData] = useState<RecordData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentVersion, setCurrentVersion] = useState<number>(1);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(initialRecordId || null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>(initialRecordId ? 'detail' : 'list');
    const [currentUser] = useState('品質保証部 ユーザー');
    const [customRecordTitle, setCustomRecordTitle] = useState<string>('');

    useEffect(() => {
        loadTemplate();
        loadDocuments();
    }, [templateId]);

    useEffect(() => {
        const fetchRecord = async () => {
            if (selectedRecordId && template) {
                await loadRecord(selectedRecordId);
                setViewMode('detail');
            }
        };
        fetchRecord();
    }, [selectedRecordId, template]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            const t = await window.electronAPI.getTemplate(templateId);
            setTemplate(t);
            setError(null);
        } catch (err) {
            setError(`テンプレートの読み込みに失敗しました: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async () => {
        try {
            const docs = await window.electronAPI.listDocuments(templateId);
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
    };

    const loadRecord = async (recordId: string) => {
        if (!template) return;

        try {
            setLoading(true);
            const docs = await window.electronAPI.listDocuments(templateId);
            const doc = docs.find(d => d.record_id === recordId);

            if (doc) {
                const result = await window.electronAPI.getRecordVersion(
                    recordId,
                    templateId,
                    doc.latest_version
                );
                if (result.ok && result.data) {
                    setFormData(result.data.data);
                    setCurrentVersion(result.data.meta.version);
                    // Restore title from saved data
                    const title = result.data.data._title as string;
                    setCustomRecordTitle(title || recordId);
                } else {
                    throw new Error(result.error || 'Failed to load record');
                }
            } else {
                setFormData({});
                setCurrentVersion(1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleNewRecord = () => {
        setSelectedRecordId(null);
        setFormData({});
        setCurrentVersion(1);
        setCustomRecordTitle('');
        setViewMode('detail');
    };

    const handleSelectRecord = (recordId: string) => {
        setCustomRecordTitle(recordId); // 一時的にrecordIdを表示
        setSelectedRecordId(recordId);
    };

    const handleBackToList = () => {
        setSelectedRecordId(null);
        setFormData({});
        setViewMode('list');
        loadDocuments();
    };

    const handleSave = async () => {
        if (!template) return;

        // Validate form
        const validateForm = (window as any).validateForm;
        if (validateForm && !validateForm()) {
            alert('入力内容に誤りがあります。赤色で表示されているフィールドを確認してください。');
            return;
        }

        // Validate title for new records
        if (!selectedRecordId && !customRecordTitle.trim()) {
            alert('記録タイトルを入力してください。');
            return;
        }

        // Generate record ID if new
        const saveRecordId = selectedRecordId || customRecordTitle.trim();

        // Include title in form data
        const dataToSave = {
            ...formData,
            _title: customRecordTitle.trim() || selectedRecordId || ''
        };

        try {
            const res = await window.electronAPI.saveRecord({
                templateId: template.template_id,
                recordId: saveRecordId,
                data: dataToSave,
                user: currentUser
            });

            if (res.ok) {
                alert('保存しました');
                setSelectedRecordId(saveRecordId);
                setCurrentVersion(currentVersion + 1);
                loadDocuments();
            } else {
                alert('保存に失敗しました: ' + res.error);
            }
        } catch (err) {
            alert('保存エラー: ' + err);
        }
    };

    const handleExportPdf = async () => {
        if (!template || !selectedRecordId) {
            alert('記録を先に保存してください');
            return;
        }

        try {
            const res = await window.electronAPI.generatePdf({
                recordId: selectedRecordId,
                templateId: template.template_id,
                version: currentVersion,
                exportedBy: currentUser,
                purpose: 'ユーザー出力'
            });

            if (res.ok) {
                alert('PDFを出力しました: ' + res.path);
            } else {
                alert('PDF出力に失敗しました: ' + res.error);
            }
        } catch (err) {
            alert('PDF出力エラー: ' + err);
        }
    };

    const handleViewVersion = async (version: number) => {
        if (!template || !selectedRecordId) return;

        try {
            const result = await window.electronAPI.getRecordVersion(
                selectedRecordId,
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

    if (loading && !template) {
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
                        <button onClick={onBack} className="text-blue-600 hover:text-blue-800">
                            ← 戻る
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

    // List View
    if (viewMode === 'list') {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                {/* Breadcrumb */}
                <div className="max-w-6xl mx-auto mb-4">
                    <nav className="flex items-center text-sm text-gray-500">
                        <button
                            onClick={onBackToDashboard}
                            className="hover:text-blue-600 hover:underline transition-colors"
                        >
                            ダッシュボード
                        </button>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">{template.template_name}</span>
                    </nav>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onBack || onBackToDashboard}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="text-purple-600" size={28} />
                                        {template.template_name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {template.category} | バージョン {template.version}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={loadDocuments}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                    title="更新"
                                >
                                    <RefreshCw size={20} />
                                </button>
                                <button
                                    onClick={handleNewRecord}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Plus size={18} />
                                    新規作成
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Records List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                記録一覧 ({documents.length}件)
                            </h2>
                        </div>

                        {documents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FileText className="mx-auto mb-4 text-gray-300" size={48} />
                                <p>まだ記録がありません</p>
                                <button
                                    onClick={handleNewRecord}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    最初の記録を作成
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                                        onClick={() => handleSelectRecord(doc.record_id)}
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{doc.record_id}</div>
                                            <div className="text-sm text-gray-500">
                                                バージョン {doc.latest_version} |
                                                更新: {new Date(doc.updated_at).toLocaleDateString('ja-JP')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {doc.status && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {doc.status}
                                                </span>
                                            )}
                                            <ArrowLeft className="rotate-180 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Detail View (Create / Edit)
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
                        onClick={handleBackToList}
                        className="hover:text-blue-600 hover:underline transition-colors"
                    >
                        {template.template_name}
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">
                        {customRecordTitle || (selectedRecordId ? selectedRecordId : '新規作成')}
                    </span>
                </nav>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToList}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {customRecordTitle || template.template_name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {template.template_name} {selectedRecordId && `| v${currentVersion}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadRecord(selectedRecordId!)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="更新"
                        disabled={!selectedRecordId}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Record Title Input */}
                <div className="mb-6">
                    <label className="block font-medium text-gray-700 mb-2">
                        記録タイトル {!selectedRecordId && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        value={customRecordTitle}
                        onChange={(e) => setCustomRecordTitle(e.target.value)}
                        placeholder="例: 検査記録-2024-001"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedRecordId ? 'タイトルを変更できます' : 'この記録を識別するためのタイトルを入力してください'}
                    </p>
                </div>

                {/* Form */}
                <DynamicForm template={template} value={formData} onChange={setFormData} />

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3">
                    {selectedRecordId && (
                        <>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const result = await window.electronAPI.openRecordFolder(selectedRecordId, template.template_id);
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

            {/* Version History Modal */}
            {selectedRecordId && template && (
                <VersionHistoryModal
                    isOpen={showVersionHistory}
                    onClose={() => setShowVersionHistory(false)}
                    recordId={selectedRecordId}
                    templateId={template.template_id}
                    currentVersion={currentVersion}
                    onViewVersion={handleViewVersion}
                    onCompareVersions={() => { }}
                />
            )}
        </div>
    );
};
