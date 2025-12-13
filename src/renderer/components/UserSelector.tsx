import { useState, useEffect } from 'react';
import { User as UserIcon, Check, UserPlus } from 'lucide-react';
import type { User } from '../global';

interface UserSelectorProps {
  onUserSelect: (userName: string) => void;
  onRegister: () => void;
}

export function UserSelector({ onUserSelect, onRegister }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.listUsers();
      if (result.ok && result.users) {
        setUsers(result.users);

        // Load last selected user from localStorage
        const lastUser = localStorage.getItem('qms_current_user');
        if (lastUser) {
          setSelectedUser(lastUser);
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (fullName: string) => {
    setSelectedUser(fullName);
  };

  const handleConfirm = async () => {
    if (selectedUser) {
      // Find the username from full_name
      const user = users.find(u => u.full_name === selectedUser);
      if (user) {
        // Update last login
        await window.electronAPI.updateLastLogin(user.username);
      }

      localStorage.setItem('qms_current_user', selectedUser);
      onUserSelect(selectedUser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <UserIcon size={48} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          QMS 帳票管理システム
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ユーザーを選択してください
        </p>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user.full_name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                selectedUser === user.full_name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-left">
                <div className={`font-medium ${
                  selectedUser === user.full_name ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {user.full_name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {user.department} • {user.role === 'manager' ? 'マネージャー' : user.role === 'admin' ? '管理者' : 'スタッフ'}
                </div>
              </div>
              {selectedUser === user.full_name && (
                <Check size={20} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedUser}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
        >
          ログイン
        </button>

        <button
          onClick={onRegister}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <UserPlus size={20} />
          新規ユーザー登録
        </button>

        <p className="mt-6 text-xs text-center text-gray-500">
          最後に選択したユーザーは自動的に記憶されます
        </p>
      </div>
    </div>
  );
}
