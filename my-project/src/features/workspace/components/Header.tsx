import { TopNavigation } from '@/widgets/navigation/TopNavigation';

interface HeaderProps {
  activeTab: 'marketplace' | 'studio' | 'knowledge' | 'library';
  onTabChange: (tab: HeaderProps['activeTab']) => void;
  userName: string;
  userEmail: string;
  onLogout: () => Promise<void> | void;
  onLogoClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
  onLogoClick,
  onToggleSidebar,
  isSidebarOpen = false,
}: HeaderProps) {
  const tabLabels = {
    marketplace: '마켓플레이스',
    studio: '스튜디오',
    knowledge: '지식 관리',
    library: '라이브러리',
  } as const;

  const activeTabLabel = tabLabels[activeTab];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur">
      <TopNavigation
        userName={userName}
        userEmail={userEmail}
        onHomeClick={() => onTabChange('studio')}
        onLogoClick={onLogoClick}
        onLogout={onLogout}
        activeTabLabel={activeTabLabel}
        showSidebarToggle
        onToggleSidebar={onToggleSidebar}
        contentClassName={isSidebarOpen ? 'pl-6 md:pl-8 lg:pl-10' : 'px-5 md:px-8 lg:px-10'}
      />
    </header>
  );
}
