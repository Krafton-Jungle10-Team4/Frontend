import { TopNavigation } from '@/widgets/navigation/TopNavigation';
import { NavigationTabs } from './NavigationTabs';

interface HeaderProps {
  activeTab: 'explore' | 'studio' | 'knowledge' | 'tools';
  onTabChange: (tab: HeaderProps['activeTab']) => void;
  workspaceName: string;
  userName: string;
  userEmail: string;
  language: 'en' | 'ko';
  onLanguageChange: (lang: 'en' | 'ko') => void;
  onToggleSidebar: () => void;
  onLogout: () => Promise<void> | void;
  onLogoClick: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  workspaceName,
  userName,
  userEmail,
  language,
  onLanguageChange,
  onToggleSidebar,
  onLogout,
  onLogoClick,
}: HeaderProps) {
  const tabLabels = {
    explore: { en: 'Explore', ko: '탐색' },
    studio: { en: 'Studio', ko: '스튜디오' },
    knowledge: { en: 'Knowledge', ko: '지식' },
    tools: { en: 'Tools', ko: '도구' },
  } as const;

  const activeTabLabel = tabLabels[activeTab][language];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur">
      <TopNavigation
        onToggleSidebar={onToggleSidebar}
        userName={userName}
        userEmail={userEmail}
        onHomeClick={() => onTabChange('studio')}
        onLogoClick={onLogoClick}
        language={language}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        workspaceLabel={workspaceName}
        serviceName="SnapAgent"
        activeTabLabel={activeTabLabel}
        showSidebarToggle={false}
        navigationTabs={
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            language={language}
          />
        }
      />
    </header>
  );
}
