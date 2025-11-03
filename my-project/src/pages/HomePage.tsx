import { useNavigate } from 'react-router-dom';
import { LeftSidebar } from '../components/LeftSidebar';
import { TopNavigation } from '../components/TopNavigation';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { SearchFilters } from '../components/SearchFilters';
import { BotCard } from '../components/BotCard';
import { EmptyState } from '../components/EmptyState';
import { RightSidebar } from '../components/RightSidebar';
import { WorkspaceSidebar } from '../components/WorkspaceSidebar';
import { useApp } from '../contexts/AppContext';

export function HomePage() {
  const navigate = useNavigate();
  const {
    userName,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    language,
    setLanguage,
    bots,
    deleteBot,
    activities,
    filteredBots,
  } = useApp();

  const handleCreateBot = () => {
    navigate('/setup');
  };

  const handleDeleteBot = (botId: string, botName: string) => {
    deleteBot(botId, botName);
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
        onClose={() => setIsSidebarOpen(false)}
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
          onToggleSidebar={() => setIsSidebarOpen(true)}
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
