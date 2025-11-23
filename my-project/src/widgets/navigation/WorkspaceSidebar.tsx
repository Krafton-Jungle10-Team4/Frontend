import { useNavigate } from 'react-router-dom';
import {
  Home,
  Puzzle,
  BarChart3,
  CreditCard,
  Settings,
  X,
  ChevronDown,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { useBilling } from '@/features/billing/hooks/useBilling';
import { Progress } from '@/shared/components/progress';

type Language = 'en' | 'ko';

export interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  currentPage?: string;
  language?: Language;
  menuItems?: MenuItem[];
  activeItemId?: string;
}

export function WorkspaceSidebar({
  isOpen,
  onClose,
  userName = 'User',
  currentPage = 'Home',
  language: _language = 'ko',
  menuItems,
  activeItemId,
}: WorkspaceSidebarProps) {
  const { billingStatus, isLoading } = useBilling();
  const navigate = useNavigate();
  if (!isOpen) return null;

  const translations = {
    ko: {
      workspace: '의 워크스페이스',
      home: '홈',
      integrations: '연동',
      usage: '사용량',
      billing: '결제',
      settings: '설정',
    },
  };

  const t = translations.ko;

  // Default menu items (Home page)
  const defaultMenuItems: MenuItem[] = [
    { id: 'home', icon: Home, label: t.home, onClick: () => navigate('/home') },
    { id: 'integrations', icon: Puzzle, label: t.integrations },
    { id: 'usage', icon: BarChart3, label: t.usage },
    { id: 'billing', icon: CreditCard, label: t.billing, onClick: () => navigate('/billing-settings') },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  const items = menuItems || defaultMenuItems;

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
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <UserCircle className="text-white" aria-hidden="true" />
                </div>
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
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItemId ? activeItemId === item.id : currentPage === item.label;

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                      isActive
                        ? 'text-gray-900 bg-gray-100 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Credit Usage Widget 추가 */}
          <div className="mt-auto p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">크레딧 사용량</h3>
            {isLoading ? (
              <p className="text-xs text-gray-500">불러오는 중...</p>
            ) : billingStatus ? (
              <div>
                <Progress value={(billingStatus.usage.monthly_cost / billingStatus.usage.total_credit) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>${billingStatus.usage.monthly_cost.toFixed(2)}</span>
                  <span>${billingStatus.usage.total_credit.toFixed(2)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
