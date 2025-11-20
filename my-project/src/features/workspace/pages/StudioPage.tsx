/**
 * StudioPage
 * 스튜디오 탭의 메인 페이지
 * - 왼쪽: LeftActionPanel (앱 만들기 액션)
 * - 상단: FilterTabs (카테고리 필터) + TopActions (검색, 태그, 뷰 모드)
 * - 메인: BotList (봇 목록 그리드/리스트)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useBots } from '@/features/bot/hooks/useBots';
import { useBotStore } from '@/features/bot/stores/botStore';
import { LeftActionPanel } from '../components/LeftActionPanel';
import { FilterTabs, type FilterTab } from '../components/FilterTabs';
import { TopActions, type ViewMode } from '../components/TopActions';
import { BotList } from '@/features/bot/components/BotList';
import { BotCreateDialog } from '@/features/bot/components/BotCreateDialog';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import type { BotCardData } from '@/features/bot/components/BotCard';
import type { Language } from '@/shared/types';
import {
  RiApps2Line,
  RiFlowChart,
  RiChatSmile3Line,
  RiRobot2Line,
  RiCheckLine,
} from '@remixicon/react';

export function StudioPage() {
  const navigate = useNavigate();
  const { studioFilters, setStudioFilters } = useWorkspaceStore();
  const { deleteBot } = useBotStore();

  // 로컬 상태
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [language] = useState<Language>('ko');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 카테고리 필터 탭
  const categoryTabs: FilterTab[] = [
    { id: 'all', label: '모두', icon: RiApps2Line },
    { id: 'workflow', label: '워크플로우', icon: RiFlowChart },
    { id: 'chatflow', label: '채팅 플로우', icon: RiChatSmile3Line },
    { id: 'chatbot', label: '챗봇', icon: RiChatSmile3Line },
    { id: 'agent', label: '에이전트', icon: RiRobot2Line },
    { id: 'completed', label: '완성', icon: RiCheckLine },
  ];

  // 카테고리를 백엔드 필터로 변환
  const getCategoryFilter = () => {
    const type = studioFilters.type;
    if (type === 'all' || type === 'completed') return undefined;
    return type;
  };

  // Bots 데이터 조회
  const { bots, loading, error } = useBots({
    searchQuery: studioFilters.searchQuery,
    category: getCategoryFilter(),
    tags: studioFilters.tags.length > 0 ? studioFilters.tags : undefined,
    onlyMine: studioFilters.onlyMine,
    autoFetch: true,
  });

  // 사용 가능한 태그 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await botApi.getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        const allTags = new Set<string>();
        bots.forEach((bot) => {
          bot.tags?.forEach((tag) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
      }
    };

    fetchTags();
  }, [bots]);

  // 각 봇의 최신 게시 버전 조회
  const [botVersions, setBotVersions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLatestVersions = async () => {
      const versionMap: Record<string, string> = {};

      await Promise.all(
        bots.map(async (bot) => {
          try {
            const versions = await workflowApi.listWorkflowVersions(bot.id, { status: 'published' });
            if (versions.length > 0) {
              versionMap[bot.id] = versions[0].version;
            }
          } catch (error) {
            console.error(`Failed to fetch versions for bot ${bot.id}:`, error);
          }
        })
      );

      setBotVersions(versionMap);
    };

    if (bots.length > 0) {
      fetchLatestVersions();
    }
  }, [bots]);

  // BotCardData 변환
  const botCards: BotCardData[] = bots.map((bot) => ({
    id: bot.id,
    name: bot.name,
    deployedDate: bot.updatedAt,
    createdAt: new Date(bot.createdAt),
    nodeCount: 0, // workflow에서 계산 필요
    edgeCount: 0, // workflow에서 계산 필요
    estimatedCost: 0, // 추후 계산 로직 추가
    tags: bot.tags,
    latestVersion: botVersions[bot.id],
  }));

  // 필터링된 봇 목록 (completed 필터 적용)
  const filteredBots =
    studioFilters.type === 'completed'
      ? botCards.filter((bot) => bot.tags?.includes('완성'))
      : botCards;

  // 핸들러
  const handleCategoryChange = (categoryId: string) => {
    setStudioFilters({ type: categoryId });
  };

  const handleSearchChange = (query: string) => {
    setStudioFilters({ searchQuery: query });
  };

  const handleTagsChange = (tags: string[]) => {
    setStudioFilters({ tags });
  };

  const handleOnlyMineChange = (value: boolean) => {
    setStudioFilters({ onlyMine: value });
  };

  const handleCreateBlank = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateFromTemplate = () => {
    // TODO: 템플릿 선택 모달 열기
    console.log('Create from template');
  };

  const handleBotCreate = async (input: { name: string; description?: string }) => {
    setIsCreating(true);
    try {
      const newBot = await botApi.create({
        name: input.name,
        description: input.description,
      });

      setIsCreateDialogOpen(false);
      navigate(`/bot/${newBot.id}/workflow`);
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert('봇 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBotClick = (botId: string) => {
    navigate(`/bot/${botId}/workflow`);
  };

  const handleBotDelete = async (botId: string, botName: string) => {
    if (confirm(`정말로 "${botName}" 봇을 삭제하시겠습니까?`)) {
      try {
        await botApi.delete(botId);
        deleteBot(botId);
      } catch (err: any) {
        console.error('Failed to delete bot:', err);

        // 404 에러인 경우 (DB에 이미 없는 경우) 로컬 상태에서도 제거
        if (err?.response?.status === 404 || err?.status === 404) {
          console.log('Bot not found in DB, removing from local state');
          deleteBot(botId);
        } else {
          alert('봇 삭제에 실패했습니다.');
        }
      }
    }
  };

  const handleBotDeploy = (botId: string) => {
    navigate(`/workspace/deployment/${botId}`);
  };

  return (
    <>
      <BotCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        language={language}
        onSubmit={handleBotCreate}
        isCreating={isCreating}
      />

      <div className="flex h-full overflow-hidden p-6 gap-4">
        {/* 카드 1: 앱 만들기 */}
        <LeftActionPanel
          variant="studio"
          onCreateBlank={handleCreateBlank}
          onCreateFromTemplate={handleCreateFromTemplate}
        />

        {/* 오른쪽 영역 */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* 카드 2: 필터 탭 + 상단 액션 */}
          <div className="rounded-lg bg-background border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
            <div className="px-6 pt-6">
              <FilterTabs
                tabs={categoryTabs}
                activeTab={studioFilters.type}
                onTabChange={handleCategoryChange}
              />
            </div>
            <div className="px-6 py-4">
              <TopActions
                searchQuery={studioFilters.searchQuery}
                onSearchChange={handleSearchChange}
                selectedTags={studioFilters.tags}
                onTagsChange={handleTagsChange}
                availableTags={availableTags}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showOnlyMine={studioFilters.onlyMine}
                onShowOnlyMineChange={handleOnlyMineChange}
              />
            </div>
          </div>

          {/* 카드 3: 봇 목록 */}
          <div className="flex-1 overflow-y-auto rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-destructive">
                  오류가 발생했습니다: {error.message}
                </p>
              </div>
            ) : (
              <BotList
                bots={filteredBots}
                searchQuery={studioFilters.searchQuery}
                viewMode={viewMode}
                language={language}
                isEmpty={bots.length === 0 && !studioFilters.searchQuery}
                hasResults={filteredBots.length > 0}
                onDelete={handleBotDelete}
                onCreateBot={handleCreateBlank}
                onBotClick={handleBotClick}
                onDeploy={handleBotDeploy}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
