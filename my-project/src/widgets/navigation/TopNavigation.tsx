import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, LogOut, CreditCard, ChevronRight } from 'lucide-react';
import { useBilling } from '@/features/billing/hooks/useBilling';
import { Avatar, AvatarFallback } from '@/shared/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { cn } from '@/shared/components/utils';
import { Logo } from '@/shared/components/Logo';

type Language = 'en' | 'ko';

interface TopNavigationProps {
  userName?: string;
  userEmail?: string;
  onHomeClick?: () => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onLogout?: () => Promise<void> | void;
  activeTabLabel?: string;
  onLogoClick?: () => void;
  showSidebarToggle?: boolean;
  contentClassName?: string;
  showInlineLogo?: boolean;
}

export function TopNavigation({
  userName = 'User',
  userEmail = '',
  onHomeClick,
  language: _language = 'ko',
  onLanguageChange: _onLanguageChange = () => undefined,
  onLogout,
  activeTabLabel: _activeTabLabel,
  onLogoClick,
  showSidebarToggle: _showSidebarToggle = true,
  contentClassName,
  showInlineLogo = false,
}: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isFreePlan, billingStatus } = useBilling();
  const userInitial = userName.charAt(0).toUpperCase();

  const t = {
    billing: '결제 및 사용량',
    accountSettings: '계정 설정',
    signOut: '로그아웃',
  };

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

  const workspaceRoot = '/workspace/studio';
  const breadcrumbMap = [
    { label: '워크스페이스', path: workspaceRoot },
    { label: '스튜디오', path: '/workspace/studio' },
    { label: '마켓플레이스', path: '/workspace/marketplace' },
    { label: '지식 관리', path: '/workspace/knowledge' },
    { label: '결제 설정', path: '/billing-settings' },
  ] as const;

  const currentSection =
    breadcrumbMap.find(
      (item) =>
        item.path !== workspaceRoot &&
        location.pathname.toLowerCase().startsWith(item.path.toLowerCase())
    ) ?? breadcrumbMap[1];

  const breadcrumbs = [
    breadcrumbMap[0],
    currentSection,
  ];

  return (
        <div className="h-16 border-b border-white/60 bg-white/70 backdrop-blur-md shadow-[0_12px_40px_rgba(55,53,195,0.12)]">

      <div className={cn("relative w-full h-full flex items-center justify-between pl-2 pr-4 md:pl-3 md:pr-6", contentClassName)}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onLogoClick ?? onHomeClick}
            className="cursor-pointer flex items-center gap-2"
          >
            {showInlineLogo && (
              <Logo className="h-8 w-8 text-[#5f5bff]" aria-label="SnapAgent Logo" />
            )}
            <span
              className="font-bold text-xl bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
              }}
            >
              SnapAgent
            </span>
          </button>

          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.path} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight size={14} className="text-gray-400" />}
                <button
                  onClick={() => navigate(crumb.path)}
                  className={cn(
                    'rounded px-2 py-1 transition-colors',
                    idx === breadcrumbs.length - 1
                      ? 'bg-gray-100 text-gray-700'
                      : 'hover:bg-gray-100 hover:text-gray-700'
                  )}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 border shadow-sm backdrop-blur',
              planClass
            )}
            aria-label={`현재 플랜: ${planName}`}
          >
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full shadow-sm', planDotClass)} />
            {planName}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/70">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-[#3735c3] text-white">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-800">{userName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border border-white/70 shadow-[0_20px_60px_rgba(55,53,195,0.18)] backdrop-blur">
              <div className="p-4 border-b border-indigo-50 bg-gradient-to-r from-white via-white to-indigo-50/50">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-[#3735c3] text-white">
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
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50/80"
                  onClick={() => navigate('/billing-settings')}
                >
                  <CreditCard size={16} className="mr-3 text-[#3735c3]" />
                  <span className="text-sm">{t.billing}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-4 py-2 cursor-pointer hover:bg-indigo-50/80">
                  <Settings size={16} className="mr-3 text-[#3735c3]" />
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
                  <LogOut size={16} className="mr-3 text-gray-500" />
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
