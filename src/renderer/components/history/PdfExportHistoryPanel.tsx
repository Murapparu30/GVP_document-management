import React, { useEffect, useState } from 'react';
import type { PdfExportLog } from '../../global';

type PdfExportHistoryPanelProps = {
  recordId: string;
  templateId: string;
};

export const PdfExportHistoryPanel: React.FC<PdfExportHistoryPanelProps> = ({
  recordId,
  templateId
}) => {
  const [logs, setLogs] = useState<PdfExportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId || !templateId) return;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await window.electronAPI.listPdfExports(recordId, templateId);
        if (!res.ok || !res.logs) {
          throw new Error(res.error || 'PDF出力履歴の取得に失敗しました');
        }
        setLogs(res.logs);
      } catch (e: any) {
        console.error(e);
        setError(e.message || '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [recordId, templateId]);

  if (!recordId) {
    return <div>まだレコードIDがありません。</div>;
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 4, fontSize: 12 }}>
      <h4 style={{ marginTop: 0 }}>PDF出力履歴</h4>

      {loading && <div>読み込み中...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && logs.length === 0 && (
        <div>PDF出力履歴はまだありません。</div>
      )}

      {!loading && !error && logs.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>版</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>出力日時</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>出力者</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>目的</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>ファイル</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ borderBottom: '1px solid #eee' }}>v{log.version}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>
                  {new Date(log.exported_at).toLocaleString()}
                </td>
                <td style={{ borderBottom: '1px solid #eee' }}>{log.exported_by}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>
                  {log.purpose || ''}
                </td>
                <td style={{ borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={async () => {
                      const res = await window.electronAPI.openPdfFile(log.file_path);
                      if (!res.ok) {
                        alert(`PDF\u3092\u958b\u3051\u307e\u305b\u3093\u3067\u3057\u305f: ${res.error}`);
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: 10,
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: 4,
                      cursor: 'pointer',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={log.file_path}
                  >
                    \ud83d\udcc4 PDF\u3092\u958b\u304f
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
