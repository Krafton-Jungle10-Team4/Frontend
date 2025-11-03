import { useNavigate } from 'react-router-dom';
import { LeftSidebar } from '../components/LeftSidebar';
import { TopNavigation } from '../components/TopNavigation';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { SearchFilters } from '../components/SearchFilters';
import { BotCard } from '../components/BotCard';
import { EmptyState } from '../components/EmptyState';
import { RightSidebar } from '../components/RightSidebar';
import { WorkspaceSidebar } from '../components/WorkspaceSidebar';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';
import { useBotStore } from '../store/botStore';
import { useActivityStore } from '../store/activityStore';
import { useMemo } from 'react';

export function HomePage() {
  const navigate = useNavigate();

  // User store
  const userName = useUserStore((state) => state.userName);

  // UI store
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  // Bot store
  const bots = useBotStore((state) => state.bots);
  const deleteBot = useBotStore((state) => state.deleteBot);

  // Activity store
  const activities = useActivityStore((state) => state.activities);
  const addActivity = useActivityStore((state) => state.addActivity);

  // Computed: filtered bots
  const filteredBots = useMemo(() => {
    if (!searchQuery) return bots;
    return bots.filter((bot) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bots, searchQuery]);

  const handleCreateBot = () => {
    navigate('/setup');
  };

  const handleDeleteBot = (botId: string, botName: string) => {
    // Delete bot from store
    deleteBot(botId);

    // Add activity log
    const translations = {
      en: { action: 'deleted bot' },
      ko: { action: '봇을 삭제했습니다' },
    };
    addActivity({
      type: 'bot_deleted',
      botId,
      botName,
      message: `${userName} ${translations[language].action}: ${botName}`,
    });
  };

  const translations = {
    en: {
      noBotsFound: 'No bots found matching',
      currentPage: 'Home'
    },
    ko: {
      noBotsFound: '와 일치하는 봇이 없습니다',
      currentPage: '홈'
    }
  };

  const t = translations[language];

  return (
    <div className="flex h-screen bg-white">
      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        currentPage={t.currentPage}
        language={language}
      />

      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <LeftSidebar onLogoClick={() => navigate('/')} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavigation
          onToggleSidebar={() => setSidebarOpen(true)}
          userName={userName}
          onHomeClick={() => navigate('/')}
          language={language}
          onLanguageChange={setLanguage}
        />

        {/* Workspace Header */}
        <WorkspaceHeader
          onCreateBot={handleCreateBot}
          userName={userName}
          botCount={bots.length}
          maxBots={5}
          language={language}
        />

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          language={language}
        />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Bots List */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {bots.length === 0 ? (
              <EmptyState onCreateBot={handleCreateBot} language={language} />
            ) : filteredBots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-sm sm:text-base text-center px-4">{language === 'en' ? `No bots found matching "${searchQuery}"` : `"${searchQuery}"${t.noBotsFound}`}</p>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
              }>
                {filteredBots.map((bot) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onDelete={handleDeleteBot}
                    viewMode={viewMode}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block">
            <RightSidebar
              totalBots={bots.length}
              activities={activities}
              maxBots={5}
              userName={userName}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
