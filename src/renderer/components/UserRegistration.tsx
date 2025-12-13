import { useState } from 'react';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';

interface UserRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function UserRegistration({ onBack, onSuccess }: UserRegistrationProps) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('品質保証部');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!username || !fullName || !department || !role) {
      setError('全ての項目を入力してください');
      return;
    }

    if (username.length < 3) {
      setError('ユーザー名は3文字以上である必要があります');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('ユーザー名は英数字とアンダースコアのみ使用できます');
      return;
    }

    setLoading(true);

    try {
      const result = await window.electronAPI.createUser({
        username,
        full_name: fullName,
        department,
        role
      });

      if (result.ok) {
        alert(`ユーザーを登録しました：${fullName}`);
        onSuccess();
      } else {
        setError(result.error || 'ユーザー登録に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          戻る
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <UserPlus size={48} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          新規ユーザー登録
        </h1>
        <p className="text-center text-gray-600 mb-8">
          アカウント情報を入力してください
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="例: yamamoto"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              3文字以上、英数字とアンダースコアのみ
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="例: 山本 太郎"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属部署 <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="品質保証部">品質保証部</option>
              <option value="製造部">製造部</option>
              <option value="開発部">開発部</option>
              <option value="営業部">営業部</option>
              <option value="管理部">管理部</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              役割 <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="staff">スタッフ</option>
              <option value="manager">マネージャー</option>
              <option value="admin">管理者</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
          >
            {loading ? '登録中...' : 'ユーザーを登録'}
          </button>
        </form>
      </div>
    </div>
  );
}
