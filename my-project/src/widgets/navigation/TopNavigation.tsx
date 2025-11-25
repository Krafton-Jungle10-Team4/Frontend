import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, CreditCard, ChevronDown } from 'lucide-react';
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

type WorkspaceTab = 'marketplace' | 'studio' | 'knowledge' | 'library';

interface TopNavigationProps {
  userName?: string;
  userEmail?: string;
  onHomeClick?: () => void;
  onLogout?: () => Promise<void> | void;
  onLogoClick?: () => void;
  contentClassName?: string;
  activeTab?: WorkspaceTab;
  onTabChange?: (tab: WorkspaceTab) => void;
}

export function TopNavigation({
  userName = 'User',
  userEmail = '',
  onHomeClick,
  onLogout,
  onLogoClick,
  contentClassName,
  activeTab = 'studio',
  onTabChange,
}: TopNavigationProps) {
  const navigate = useNavigate();
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

  // Tab navigation items
  const tabs: { id: WorkspaceTab; label: string }[] = [
    { id: 'studio', label: '스튜디오' },
    { id: 'marketplace', label: '마켓플레이스' },
    { id: 'knowledge', label: '지식 관리' },
  ];

  const handleTabClick = (tab: WorkspaceTab) => {
    onTabChange?.(tab);
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className={cn("relative w-full h-full flex items-center justify-between", contentClassName)}>
        {/* Left: Logo + Navigation Tabs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={onLogoClick ?? onHomeClick}
            className="cursor-pointer flex items-center gap-2"
          >
            <Logo className="h-8 w-8 text-[#5f5bff]" aria-label="SnapAgent Logo" />
            <span
              className="font-bold text-xl bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
              }}
            >
              SnapAgent
            </span>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-md transition-colors',
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Plan + User */}
        <div className="flex items-center gap-3">
          {/* Plan Badge */}
          <div className={cn('px-3 py-1.5 rounded-md text-xs', planClass)}>
            {planName} Plan
          </div>
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-md transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-blue-700 text-white text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0 rounded-lg border border-gray-200 shadow-lg">
              <div className="p-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-blue-700 text-white text-xs">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{userName}</p>
                    <p className="text-[10px] text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <DropdownMenuItem
                  className="px-2.5 py-1.5 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate('/billing-settings')}
                >
                  <CreditCard size={14} className="mr-2 text-gray-600" />
                  <span className="text-xs">{t.billing}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-2.5 py-1.5 cursor-pointer hover:bg-gray-50">
                  <Settings size={14} className="mr-2 text-gray-600" />
                  <span className="text-xs">{t.accountSettings}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    className="px-2.5 py-1.5 cursor-pointer text-red-600 focus:text-red-600 hover:bg-gray-50"
                    onClick={() => {
                      void onLogout();
                    }}
                  >
                    <LogOut size={14} className="mr-2" />
                    <span className="text-xs">{t.signOut}</span>
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
