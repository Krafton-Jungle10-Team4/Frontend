/**
 * HomePage - Container Component
 * Bot 목록 페이지의 Container 컴포넌트
 * 상태 관리와 비즈니스 로직을 담당하고, Presentational 컴포넌트에 props를 전달
 */

import { useState } from 'react';
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
import { BotTagsDialog } from '../components/BotTagsDialog';
import { BotFilterSidebar } from '../components/BotFilterSidebar';
import { useAuth, useAuthStore } from '@/features/auth';
import { useBilling } from '@/features/billing/hooks/useBilling';
import { useUIStore } from '@/shared/stores/uiStore';
import { useActivityStore } from '@/features/activity';
import { useFilteredBots } from '../hooks/useFilteredBots';
import { useBotActions } from '../hooks/useBotActions';
import { useBotCreateDialog } from '../hooks/useBotCreateDialog';
import { useBots } from '../hooks/useBots';
import { botApi } from '../api/botApi';
import { useBotStore } from '../stores/botStore';
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

  // 태그 편집 다이얼로그 상태
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string>('');
  const [editingBotTags, setEditingBotTags] = useState<string[]>([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const updateBot = useBotStore((state) => state.updateBot);

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
    allTags,
  } = useFilteredBots({ searchQuery, selectedTags: selectedFilterTags });
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

  // 배포 관리 페이지로 이동
  const handleNavigateDeployment = (botId: string) => {
    navigate(`/workspace/deployment/${botId}`);
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

  const handleEditTags = (botId: string, currentTags: string[]) => {
    setEditingBotId(botId);
    setEditingBotTags(currentTags);
    setIsTagsDialogOpen(true);
  };

  const handleSaveTags = async (botId: string, tags: string[]) => {
    try {
      const updatedBot = await botApi.update(botId, { tags });
      updateBot(updatedBot);
    } catch (error) {
      console.error('Failed to update tags:', error);
      throw error;
    }
  };

  const handleTagFilterToggle = (tag: string) => {
    setSelectedFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const t = {
    currentPage: '홈',
  };

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
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/workspace/studio')}
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
          {/* Tag Filter Sidebar */}
          <BotFilterSidebar
            allTags={allTags}
            selectedTags={selectedFilterTags}
            onTagToggle={handleTagFilterToggle}
            language={language}
          />

          {/* Bots List */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {botsLoading && isEmpty ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-sm sm:text-base">
                  서비스들을 불러오는 중입니다...
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
                onNavigateDeployment={handleNavigateDeployment}
                onEditTags={handleEditTags}
              />
            )}
            {botsError && (
              <p className="mt-4 text-sm text-red-500">
                서비스 목록을 불러오지 못했습니다. 다시 시도해주세요.
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

      {/* Bot Tags Dialog */}
      <BotTagsDialog
        open={isTagsDialogOpen}
        onOpenChange={setIsTagsDialogOpen}
        botId={editingBotId}
        currentTags={editingBotTags}
        onSave={handleSaveTags}
        language={language}
      />
    </div>
  );
}
