import { useState, useEffect } from 'react';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { ComplaintListPage } from './pages/ComplaintListPage';
import { CorrectiveActionDetailPage } from './pages/CorrectiveActionDetailPage';
import { CorrectiveActionListPage } from './pages/CorrectiveActionListPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomTemplateRecordPage } from './pages/CustomTemplateRecordPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserSelector } from './components/UserSelector';
import { UserRegistration } from './components/UserRegistration';
import { FileText, ClipboardCheck, BarChart3, LogOut, Settings } from 'lucide-react';

type View =
  | { type: 'dashboard' }
  | { type: 'complaints'; filter?: { status?: string } }
  | { type: 'complaintDetail'; recordId: string | null }
  | { type: 'correctives'; filter?: { status?: string; overdue?: boolean; dueSoon?: boolean } }
  | { type: 'correctiveDetail'; recordId: string | null }
  | { type: 'customTemplateDetail'; templateId: string; recordId: string | null }
  | { type: 'settings' };

function App() {
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('qms_current_user');
    console.log('[Renderer] App mounted, savedUser:', savedUser);
    if (savedUser) {
      console.log('[Renderer] Setting currentUser to:', savedUser);
      setCurrentUser(savedUser);
    }
  }, []);

  const handleUserSelect = (userName: string) => {
    console.log('[Renderer] handleUserSelect:', userName);
    localStorage.setItem('qms_current_user', userName);
    setCurrentUser(userName);
    setShowRegistration(false);
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      localStorage.removeItem('qms_current_user');
      setCurrentUser(null);
      setView({ type: 'dashboard' });
    }
  };

  const handleShowRegistration = () => {
    setShowRegistration(true);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
  };

  const handleRegistrationSuccess = () => {
    console.log('[Renderer] Registration successful, returning to login');
    setShowRegistration(false);
  };

  if (showRegistration) {
    console.log('[Renderer] Showing registration form');
    return (
      <UserRegistration
        onBack={handleBackToLogin}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  if (!currentUser) {
    console.log('[Renderer] No user logged in, showing user selector');
    return (
      <UserSelector
        onUserSelect={handleUserSelect}
        onRegister={handleShowRegistration}
      />
    );
  }

  console.log('[Renderer] Rendering main app, user:', currentUser, 'view:', view.type);

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setView({ type: 'dashboard' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mr-8 ${view.type === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <BarChart3 size={20} />
              <span className="font-bold">ダッシュボード</span>
            </button>

            <div className="flex items-center gap-2 border-l border-gray-200 pl-8">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">記録管理</span>
              <button
                onClick={() => setView({ type: 'complaints' })}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${view.type === 'complaints' || view.type === 'complaintDetail'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <FileText size={18} />
                苦情処理
              </button>
              <button
                onClick={() => setView({ type: 'correctives' })}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${view.type === 'correctives' || view.type === 'correctiveDetail'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <ClipboardCheck size={18} />
                是正処置
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView({ type: 'settings' })}
              className={`p-2 rounded-full transition-colors ${view.type === 'settings'
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              title="設定"
            >
              <Settings size={20} />
            </button>
            <div className="text-sm text-right hidden sm:block">
              <div className="text-gray-500 text-xs">ログイン中</div>
              <div className="font-medium text-gray-900">{currentUser}</div>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="ログアウト"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (view.type) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenComplaints={(filter) => setView({ type: 'complaints', filter })}
            onOpenCorrectives={(filter) => setView({ type: 'correctives', filter })}
            onOpenComplaintDetail={(recordId) => setView({ type: 'complaintDetail', recordId })}
            onOpenCorrectiveDetail={(recordId) => setView({ type: 'correctiveDetail', recordId })}
            onCreateComplaint={() => setView({ type: 'complaintDetail', recordId: null })}
            onCreateCorrective={() => setView({ type: 'correctiveDetail', recordId: null })}
            onOpenCustomTemplate={(templateId: string) => setView({ type: 'customTemplateDetail', templateId, recordId: null })}
          />
        );

      case 'complaints':
        return (
          <ComplaintListPage
            initialFilter={view.filter}
            onSelectRecord={(recordId) => setView({ type: 'complaintDetail', recordId })}
            onCreateNew={() => setView({ type: 'complaintDetail', recordId: null })}
            onBackToDashboard={() => setView({ type: 'dashboard' })}
          />
        );

      case 'complaintDetail':
        return (
          <ComplaintDetailPage
            recordId={view.recordId || undefined}
            onBack={() => setView({ type: 'complaints' })}
            onBackToDashboard={() => setView({ type: 'dashboard' })}
            onNavigateToCorrectiveAction={(recordId) =>
              setView({ type: 'correctiveDetail', recordId })
            }
          />
        );

      case 'correctives':
        return (
          <CorrectiveActionListPage
            initialFilter={view.filter}
            onSelectRecord={(recordId) => setView({ type: 'correctiveDetail', recordId })}
            onCreateNew={() => setView({ type: 'correctiveDetail', recordId: null })}
            onBackToDashboard={() => setView({ type: 'dashboard' })}
          />
        );

      case 'correctiveDetail':
        return (
          <CorrectiveActionDetailPage
            recordId={view.recordId || undefined}
            onBack={() => setView({ type: 'correctives' })}
            onBackToDashboard={() => setView({ type: 'dashboard' })}
            onNavigateToComplaint={(recordId) =>
              setView({ type: 'complaintDetail', recordId })
            }
          />
        );

      case 'customTemplateDetail':
        return (
          <CustomTemplateRecordPage
            templateId={view.templateId}
            recordId={view.recordId}
            onBack={() => setView({ type: 'dashboard' })}
            onBackToDashboard={() => setView({ type: 'dashboard' })}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            onBack={() => setView({ type: 'dashboard' })}
          />
        );
    }
  };

  const Sidebar = () => (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold">QMS ナビゲーション</h2>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setView({ type: 'dashboard' })}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${view.type === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <BarChart3 size={18} />
            ダッシュボード
          </button>

          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold mb-2">記録管理</div>
            <button
              onClick={() => setView({ type: 'complaints' })}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${view.type === 'complaints' || view.type === 'complaintDetail' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <FileText size={16} />
              苦情処理一覧
            </button>
            <button
              onClick={() => setView({ type: 'correctives' })}
              className={`w-full text-left mt-2 px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${view.type === 'correctives' || view.type === 'correctiveDetail' ? 'bg-green-50 text-green-700 border border-green-100' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <ClipboardCheck size={16} />
              是正処置一覧
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {Sidebar()}
        <main className="flex-1">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
