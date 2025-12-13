// HistoryModal component

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    versions: Array<{
        version: number;
        status: string;
        updatedBy: string;
        updatedAt: string;
    }>;
}

export function HistoryModal({ isOpen, onClose, versions }: HistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">更新履歴 (Traceability)</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">閉じる</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {versions.map((version, versionIdx) => (
                                <li key={version.version}>
                                    <div className="relative pb-8">
                                        {versionIdx !== versions.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${version.version === 1 ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}>
                                                    <span className="text-white text-xs font-bold">{version.version}</span>
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Status: <span className="font-medium text-gray-900">{version.status || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        User: {version.updatedBy}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time dateTime={version.updatedAt}>
                                                        {new Date(version.updatedAt).toLocaleString('ja-JP')}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg border-t">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
