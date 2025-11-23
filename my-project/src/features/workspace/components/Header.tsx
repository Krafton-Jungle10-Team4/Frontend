import { TopNavigation } from '@/widgets/navigation/TopNavigation';
import { NavigationTabs } from './NavigationTabs';

interface HeaderProps {
  activeTab: 'marketplace' | 'studio' | 'knowledge' | 'library';
  onTabChange: (tab: HeaderProps['activeTab']) => void;
  userName: string;
  userEmail: string;
  onLogout: () => Promise<void> | void;
  onLogoClick: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
  onLogoClick,
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
        showSidebarToggle={false}
        navigationTabs={
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        }
      />
    </header>
  );
}
