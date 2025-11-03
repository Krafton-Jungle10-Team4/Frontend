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
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { useActivityStore } from '@/features/activity';
import { useFilteredBots } from '../hooks/useFilteredBots';
import { useBotActions } from '../hooks/useBotActions';

export function HomePage() {
  const navigate = useNavigate();

  // Auth store - 실제 로그인한 사용자 정보
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

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

  // Custom hooks
  const {
    bots: filteredBots,
    totalCount,
    isEmpty,
    hasResults,
  } = useFilteredBots({ searchQuery });
  const { handleCreateBot, handleDeleteBot } = useBotActions();

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
          userEmail={userEmail}
          onHomeClick={() => navigate('/')}
          language={language}
          onLanguageChange={setLanguage}
        />

        {/* Workspace Header */}
        <WorkspaceHeader
          onCreateBot={handleCreateBot}
          userName={userName}
          botCount={totalCount}
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
            <BotList
              bots={filteredBots}
              searchQuery={searchQuery}
              viewMode={viewMode}
              language={language}
              isEmpty={isEmpty}
              hasResults={hasResults}
              onDelete={handleDeleteBot}
              onCreateBot={handleCreateBot}
            />
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
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
  );
}
