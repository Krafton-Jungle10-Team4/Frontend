import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PanelLeft,
  Languages,
  Settings,
  Link2,
  KeyRound,
  Bug,
  Palette,
  LogOut,
  Zap,
  Crown,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useBilling } from '@/features/billing/hooks/useBilling';
import { Avatar, AvatarFallback } from '@/shared/components/avatar';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';

type Language = 'en' | 'ko';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  userName?: string;
  userEmail?: string;
  onHomeClick?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout?: () => Promise<void> | void;
  serviceName?: string;
  activeTabLabel?: string;
  onLogoClick?: () => void;
  navigationTabs?: ReactNode;
  showSidebarToggle?: boolean;
}

const PlanDisplay = () => {
  const { billingStatus } = useBilling();

  if (!billingStatus) {
    return null;
  }

  const { plan_id, name } = billingStatus.current_plan;

  const planConfig = {
    free: {
      icon: null,
      className: 'bg-gray-100 text-gray-800',
    },
    pro: {
      icon: <Zap size={14} className="text-yellow-500" />,
      className: 'bg-yellow-100 text-yellow-800',
    },
    enterprise: {
      icon: <Crown size={14} className="text-purple-500" />,
      className: 'bg-purple-100 text-purple-800',
    },
  };

  const config = planConfig[plan_id];

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm bg-white text-gray-800`}>
      {config.icon}
      <span>{name}</span>
    </div>
  );
};

export function TopNavigation({
  onToggleSidebar,
  userName = 'User',
  userEmail = '',
  onHomeClick,
  language,
  onLanguageChange,
  onLogout,
  serviceName = 'SnapAgent',
  activeTabLabel,
  onLogoClick,
  navigationTabs,
  showSidebarToggle = true,
}: TopNavigationProps) {
  const navigate = useNavigate();
  const { isFreePlan } = useBilling();
  const userInitial = userName.charAt(0).toUpperCase();
  const brandAccent = '#1CC8A0';

  const translations = {
    en: {
      workspace: "'s Workspace",
      upgrade: 'Upgrade',
      accountSettings: 'Account Settings',
      linkSocialAccounts: 'Link social accounts',
      changePassword: 'Change password',
      reportBug: 'Report a bug',
      appearance: 'Appearance',
      signOut: 'Sign out',
    },
    ko: {
      workspace: '의 워크스페이스',
      upgrade: '업그레이드',
      accountSettings: '계정 설정',
      linkSocialAccounts: '소셜 계정 연결',
      changePassword: '비밀번호 변경',
      reportBug: '버그 신고',
      appearance: '외관',
      signOut: '로그아웃',
    },
  };

  const t = translations[language];

  return (
    <div className="bg-[#f5f7fb] border-b border-[#e3e7f3]">
      <div className="relative flex h-20 items-center px-4 sm:px-6">
        <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
            >
              <PanelLeft size={18} className="text-gray-600 transition-colors duration-200" />
            </button>
          )}
          <button
            onClick={onLogoClick ?? onHomeClick}
            className="flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="text-2xl font-semibold text-gray-700 leading-none tracking-tight">
              <span style={{ color: brandAccent }}>S</span>
              nap
              <span style={{ color: brandAccent }}>A</span>
              gent
            </span>
          </button>
          {activeTabLabel && (
            <span className="hidden md:inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
              {activeTabLabel}
            </span>
          )}
          {isFreePlan && (
            <Button
              variant="default"
              size="sm"
              className="rounded-full px-5 ml-2 border-2 border-sky-200 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 hover:brightness-110"
              onClick={() => navigate('/pricing')}
            >
              <Sparkles size={14} className="mr-1.5 text-white" />
              Free · {t.upgrade}
            </Button>
          )}
        </div>

        {navigationTabs && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navigationTabs}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange(language === 'en' ? 'ko' : 'en')}
            className="text-sm gap-1 sm:gap-2 rounded-full border-none bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 hover:bg-gray-50"
          >
            <Languages size={16} className="transition-colors duration-200" />
            <span className="hidden sm:inline">
              {language === 'en' ? '한국어' : 'English'}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 rounded-full px-2 py-1 hover:bg-white hover:shadow-md">
                <Avatar className="w-9 h-9 cursor-pointer transition-all duration-200">
                  <AvatarFallback className="bg-teal-500 text-white">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 inline-flex items-center gap-1 transition-colors duration-200">
                  {userName}
                  <ChevronDown size={12} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-4 border-b bg-[#f8f9ff]">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-teal-500 text-white">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <Settings size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.accountSettings}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <Link2 size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.linkSocialAccounts}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <KeyRound size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.changePassword}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <Bug size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.reportBug}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <Palette size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.appearance}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    className="px-4 py-2 cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => {
                      void onLogout();
                    }}
                  >
                    <LogOut size={16} className="mr-3 text-gray-600" />
                    <span className="text-sm">{t.signOut}</span>
                  </DropdownMenuItem>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
