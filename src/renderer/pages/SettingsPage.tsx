import React, { useEffect, useState } from 'react';
import { ArrowLeft, FolderOpen, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';

interface SettingsPageProps {
    onBack: () => void;
}

interface AppConfig {
    dataPath: string | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [currentDataPath, setCurrentDataPath] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const cfg = await window.electronAPI.getConfig();
            const path = await window.electronAPI.getDataPath();
            setConfig(cfg);
            setCurrentDataPath(path);
        } catch (err) {
            setMessage({ type: 'error', text: `設定の読み込みに失敗しました: ${err}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFolder = async () => {
        try {
            setSaving(true);
            const result = await window.electronAPI.selectDataFolder();

            if (result.canceled) {
                return;
            }

            if (!result.ok) {
                setMessage({ type: 'error', text: result.error || 'フォルダの選択に失敗しました' });
                return;
            }

            // Save the new path
            const selectedPath = result.path || null;
            const saveResult = await window.electronAPI.saveConfig({ dataPath: selectedPath });

            if (saveResult.ok) {
                setConfig({ dataPath: selectedPath });
                setMessage({
                    type: 'warning',
                    text: '設定を保存しました。変更を反映するにはアプリを再起動してください。'
                });
            } else {
                setMessage({ type: 'error', text: saveResult.error || '設定の保存に失敗しました' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: `エラー: ${err}` });
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefault = async () => {
        try {
            setSaving(true);
            const result = await window.electronAPI.resetDataPath();

            if (result.ok) {
                setConfig({ dataPath: null });
                setMessage({
                    type: 'warning',
                    text: 'デフォルトに戻しました。変更を反映するにはアプリを再起動してください。'
                });
            } else {
                setMessage({ type: 'error', text: result.error || 'リセットに失敗しました' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: `エラー: ${err}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Breadcrumb */}
            <div className="max-w-4xl mx-auto mb-4">
                <nav className="flex items-center text-sm text-gray-500">
                    <button
                        onClick={onBack}
                        className="hover:text-blue-600 hover:underline transition-colors"
                    >
                        ダッシュボード
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">設定</span>
                </nav>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
                        <p className="text-sm text-gray-500">アプリケーションの設定を管理します</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' :
                        message.type === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        <AlertCircle size={20} />
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Data Storage Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FolderOpen className="text-blue-600" size={20} />
                        データ保存先
                    </h2>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-500 mb-2">現在の保存先:</p>
                        <p className="font-mono text-sm text-gray-800 break-all">{currentDataPath}</p>
                        {config?.dataPath && (
                            <span className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                カスタム設定
                            </span>
                        )}
                        {!config?.dataPath && (
                            <span className="mt-2 inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                デフォルト
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSelectFolder}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FolderOpen size={18} />
                            フォルダを選択...
                        </button>

                        {config?.dataPath && (
                            <button
                                onClick={handleResetToDefault}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <RotateCcw size={18} />
                                デフォルトに戻す
                            </button>
                        )}

                        <button
                            onClick={loadConfig}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} />
                            更新
                        </button>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        💡 <strong>ヒント:</strong> 共有フォルダ（Dropbox、Google Drive、NASなど）を選択すると、複数のPCでデータを共有できます。
                    </p>
                </section>

                {/* Info Section */}
                <section className="border-t pt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">データ保存について</h2>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>• <strong>データベース</strong>: ドキュメント一覧、ユーザー情報、履歴</p>
                        <p>• <strong>レコードファイル</strong>: 帳票データ（JSON形式、バージョン管理）</p>
                        <p>• <strong>テンプレート</strong>: フォーム定義ファイル</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
