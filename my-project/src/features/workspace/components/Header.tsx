import { TopNavigation } from '@/widgets/navigation/TopNavigation';

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
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur">
      <TopNavigation
        userName={userName}
        userEmail={userEmail}
        onHomeClick={() => onTabChange('studio')}
        onLogoClick={onLogoClick}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={onTabChange}
        contentClassName="px-20"
      />
    </header>
  );
}
