/**
 * HomePage - Container Component
 * Bot 목록 페이지의 Container 컴포넌트
 * 상태 관리와 비즈니스 로직을 담당하고, Presentational 컴포넌트에 props를 전달
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
import { useBilling } from '@/features/billing/hooks/useBilling';
import { useUIStore } from '@/shared/stores/uiStore';
import { useActivityStore } from '@/features/activity';
import { useFilteredBots } from '../hooks/useFilteredBots';
import { useBotActions } from '../hooks/useBotActions';
import { useBotCreateDialog } from '../hooks/useBotCreateDialog';
import { useBots } from '../hooks/useBots';
import type { Plan } from '@/features/billing/mock/billingMock';

const PLAN_BOT_LIMITS: Record<Plan['plan_id'], number> = {
  free: 3,
  pro: 10,
  enterprise: Number.POSITIVE_INFINITY,
};

export function HomePage() {
  const navigate = useNavigate();

  // Auth store - 실제 로그인한 사용자 정보
  const user = useAuthStore((state) => state.user);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const { logout } = useAuth();

  // UI store
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  // Activity store
  const activities = useActivityStore((state) => state.activities);
  const { billingStatus } = useBilling();
  const currentPlanId: Plan['plan_id'] =
    billingStatus?.current_plan.plan_id ?? 'free';
  const planBotLimit = PLAN_BOT_LIMITS[currentPlanId];

  // Custom hooks
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

  // Bot 카드 클릭 시 워크플로우 페이지로 이동
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
    en: {
      currentPage: 'Home',
    },
    ko: {
      currentPage: '홈',
    },
  };

  const t = translations[language];

  return (
    <div className="flex h-screen bg-background">
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
        <LeftSidebar onLogoClick={() => navigate('/home')} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavigation
          onToggleSidebar={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/home')}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
        />

        {/* Workspace Header */}
        <WorkspaceHeader
          onCreateBot={openCreateDialog}
          isCreatingBot={isCreatingBot}
          userName={userName}
          botCount={totalCount}
          maxBots={planBotLimit}
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

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block">
            <RightSidebar
              totalBots={totalCount}
              activities={activities}
              maxBots={planBotLimit}
              userName={userName}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Bot Create Dialog */}
      <BotCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreateDialog}
        language={language}
        onSubmit={createBot}
        isCreating={isCreatingBot}
      />
    </div>
  );
}
