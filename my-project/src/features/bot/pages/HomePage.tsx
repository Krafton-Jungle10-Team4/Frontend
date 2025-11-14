/**
 * @file HomePage.tsx
 * @description Bot 목록 페이지의 Container 컴포넌트 (Billing 플로우 추가)
 */

import { useNavigate } from 'react-router-dom';
import {
  LeftSidebar,
  TopNavigation,
  WorkspaceHeader,
  RightSidebar,
  WorkspaceSidebar,
} from '@/widgets';
import { SearchFilters } from '../components/SearchFilters';
import { BotList } from '../components/BotList';
import { BotCreateDialog } from '../components/BotCreateDialog';
import { useAuth, useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { useActivityStore } from '@/features/activity';
import { useFilteredBots } from '../hooks/useFilteredBots';
import { useBotActions } from '../hooks/useBotActions';
import { useBotCreateDialog } from '../hooks/useBotCreateDialog';
import { useBots } from '../hooks/useBots';

export function HomePage() {
  const navigate = useNavigate();

  // --- 기존 상태 및 훅 ---
  const user = useAuthStore((state) => state.user);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const { logout } = useAuth();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const activities = useActivityStore((state) => state.activities);
  const {
    bots: filteredBots,
    totalCount,
    isEmpty,
    hasResults,
  } = useFilteredBots({ searchQuery });
  const { handleDeleteBot } = useBotActions();
  const {
    isOpen: isCreateDialogOpen,
    isCreating: isCreatingBot,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    createBot,
  } = useBotCreateDialog();
  const { loading: botsLoading, error: botsError } = useBots();

  const handleBotClick = (botId: string) => {
    const bot = filteredBots.find((b) => b.id === botId);
    navigate(`/bot/${botId}/workflow`, {
      state: { botName: bot?.name || 'Bot' },
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetAuthStore();
      navigate('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const translations = {
    en: { currentPage: 'Home' },
    ko: { currentPage: '홈' },
  };
  const t = translations[language];

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* ... (기존 사이드바, 네비게이션 등 UI 구조는 동일) ... */}
        <WorkspaceSidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userName={userName}
          currentPage={t.currentPage}
          language={language}
        />
        <div className="hidden lg:block">
          <LeftSidebar onLogoClick={() => navigate('/home')} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavigation
            onToggleSidebar={() => setSidebarOpen(true)}
            userName={userName}
            userEmail={userEmail}
            onHomeClick={() => navigate('/home')}
            language={language}
            onLanguageChange={setLanguage}
            onLogout={handleLogout}
          />
          <WorkspaceHeader
            onCreateBot={openCreateDialog}
            isCreatingBot={isCreatingBot}
            userName={userName}
            botCount={totalCount}
            maxBots={5}
            language={language}
          />
          
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            language={language}
          />
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {/* ... (기존 BotList 및 로딩/에러 처리 로직) ... */}
              {botsLoading && isEmpty ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-sm sm:text-base">
                  {language === 'en'
                    ? 'Loading bots...'
                    : '봇을 불러오는 중입니다...'}
                </p>
              </div>
            ) : (
              <BotList
                bots={filteredBots}
                searchQuery={searchQuery}
                viewMode={viewMode}
                language={language}
                isEmpty={isEmpty}
                hasResults={hasResults}
                onDelete={handleDeleteBot}
                onCreateBot={openCreateDialog}
                onBotClick={handleBotClick}
              />
            )}
            {botsError && (
              <p className="mt-4 text-sm text-red-500">
                {language === 'en'
                  ? 'Failed to load bots. Please try again.'
                  : '봇 목록을 불러오지 못했습니다. 다시 시도해주세요.'}
              </p>
            )}
            </div>
            <div className="hidden xl:block">
              <RightSidebar
                totalBots={totalCount}
                activities={activities}
                maxBots={5}
                userName={userName}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
