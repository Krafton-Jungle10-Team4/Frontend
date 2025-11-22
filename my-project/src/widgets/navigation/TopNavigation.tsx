import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Languages,
  Settings,
  Link2,
  KeyRound,
  Bug,
  Palette,
  LogOut,
  ChevronDown,
  CreditCard,
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
import { Logo } from '@/shared/components/Logo';
import { cn } from '@/shared/components/utils';

type Language = 'en' | 'ko';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  userName?: string;
  userEmail?: string;
  onHomeClick?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout?: () => Promise<void> | void;
  activeTabLabel?: string;
  onLogoClick?: () => void;
  navigationTabs?: ReactNode;
  showSidebarToggle?: boolean;
}

export function TopNavigation({
  onToggleSidebar,
  userName = 'User',
  userEmail = '',
  onHomeClick,
  language,
  onLanguageChange,
  onLogout,
  activeTabLabel,
  onLogoClick,
  navigationTabs,
  showSidebarToggle = true,
}: TopNavigationProps) {
  const navigate = useNavigate();
  const { isFreePlan, billingStatus } = useBilling();
  const userInitial = userName.charAt(0).toUpperCase();
  const brandAccent = '#1CC8A0';

  const translations = {
    en: {
      workspace: "'s Workspace",
      upgrade: 'Upgrade',
      billing: 'Billing & Usage',
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
      billing: '결제 및 사용량',
      accountSettings: '계정 설정',
      linkSocialAccounts: '소셜 계정 연결',
      changePassword: '비밀번호 변경',
      reportBug: '버그 신고',
      appearance: '외관',
      signOut: '로그아웃',
    },
  };

  const t = translations[language];

  const planId = billingStatus?.current_plan.plan_id ?? (isFreePlan ? 'free' : 'pro');
  const planName = billingStatus?.current_plan.name ?? (isFreePlan ? 'Free' : 'Pro');

  const planBadgeStyle = {
    free: 'border border-slate-200 bg-white text-slate-600 shadow-sm',
    pro: 'text-white shadow-[0_10px_25px_rgba(55,53,195,0.25)] bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff]',
    enterprise:
      'text-amber-950 bg-gradient-to-r from-[#fff1d6] via-[#ffe3aa] to-[#e6f6ff] border border-amber-100 shadow-[0_10px_26px_rgba(255,183,94,0.4)]',
  } as const;

  const planClass = planBadgeStyle[planId as 'free' | 'pro' | 'enterprise'] ?? planBadgeStyle.free;
  const planDotStyle = {
    free: 'bg-slate-400/80',
    pro: 'bg-white/80',
    enterprise: 'bg-amber-600/80',
  } as const;
  const planDotClass = planDotStyle[planId as 'free' | 'pro' | 'enterprise'] ?? planDotStyle.free;

  return (
    <div className="border-b transition-all h-16 bg-gray-100 border-border">
      <div className="relative w-full flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onLogoClick ?? onHomeClick}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7 text-indigo-600" />
              <span
                className="font-bold text-xl bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
                }}
              >
                SnapAgent
              </span>
            </div>
          </button>

        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navigationTabs}
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
              planClass
            )}
            aria-label={`Current plan: ${planName}`}
          >
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full shadow-sm', planDotClass)} />
            {planName}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="p-4 border-b bg-[#f8f9ff]">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-blue-600 text-white">
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
                <DropdownMenuItem
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => navigate('/billing-settings')}
                >
                  <CreditCard size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.billing}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                  <Settings size={16} className="mr-3 text-gray-600" />
                  <span className="text-sm">{t.accountSettings}</span>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="px-4 py-2 cursor-pointer">
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
                </DropdownMenuItem> */}
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
