import {
  Home,
  Puzzle,
  BarChart3,
  CreditCard,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react';

type Language = 'en' | 'ko';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  currentPage?: string;
  language: Language;
}

export function WorkspaceSidebar({
  isOpen,
  onClose,
  userName = 'User',
  currentPage = 'Home',
  language,
}: WorkspaceSidebarProps) {
  if (!isOpen) return null;

  const translations = {
    en: {
      workspace: "'s Workspace",
      home: 'Home',
      integrations: 'Integrations',
      usage: 'Usage',
      billing: 'Billing',
      settings: 'Settings',
    },
    ko: {
      workspace: '의 워크스페이스',
      home: '홈',
      integrations: '연동',
      usage: '사용량',
      billing: '결제',
      settings: '설정',
    },
  };

  const t = translations[language];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">
                      {userName}
                      {t.workspace}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3">
            <div className="space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                  currentPage === t.home
                    ? 'text-gray-900 bg-gray-100 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                <span>{t.home}</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Puzzle size={18} />
                <span>{t.integrations}</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <BarChart3 size={18} />
                <span>{t.usage}</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <CreditCard size={18} />
                <span>{t.billing}</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings size={18} />
                <span>{t.settings}</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
