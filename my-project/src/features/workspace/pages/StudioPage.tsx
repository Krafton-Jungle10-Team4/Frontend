import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Tag as TagIcon, Search, X } from 'lucide-react';
import { WorkflowGrid } from '@/features/studio/components/WorkflowGrid';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import { selectFilteredAndSortedWorkflows } from '@/features/studio/stores/selectors';
import { useBotCreateDialog } from '@/features/bot/hooks/useBotCreateDialog';
import { BotCreateDialog } from '@/features/bot/components/BotCreateDialog';
import { BotTagsDialog } from '@/features/bot/components/BotTagsDialog';
import { DeploymentModal } from '@/features/deployment/components/DeploymentModal';
import { useUIStore } from '@/shared/stores/uiStore';
import { toast } from 'sonner';
import { cn } from '@/shared/components/utils';
import { Badge } from '@/shared/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';

type StatusFilter = 'all' | 'deployed' | 'draft';

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '모두' },
  { id: 'deployed', label: '배포됨' },
  { id: 'draft', label: '진행중' },
];

export function StudioPage() {
  const navigate = useNavigate();
  const workflows = useWorkflowStore((state) => state.workflows);
  const loading = useWorkflowStore((state) => state.loading);
  const error = useWorkflowStore((state) => state.error);
  const filters = useWorkflowStore((state) => state.filters);
  const sortBy = useWorkflowStore((state) => state.sortBy);
  const fetchWorkflows = useWorkflowStore((state) => state.fetchWorkflows);
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const language = useUIStore((state) => state.language);
  const {
    isOpen: isCreateDialogOpen,
    isCreating: isCreatingBot,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    createBot,
  } = useBotCreateDialog();

  // 상태 필터
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 태그 필터
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // 검색
  const [searchValue, setSearchValue] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const setFilters = useWorkflowStore((state) => state.setFilters);

  // 태그 편집 다이얼로그 상태
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string>('');
  const [editingWorkflowTags, setEditingWorkflowTags] = useState<string[]>([]);


  // 배포 관리 모달 상태
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [selectedBotIdForDeployment, setSelectedBotIdForDeployment] = useState<string>('');

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    workflows.forEach((w) => {
      w.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [workflows]);

  // 태그 검색 필터링
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [allTags, tagSearchQuery]);

  const filteredWorkflows = useMemo(() => {
    let result = selectFilteredAndSortedWorkflows(workflows, filters, sortBy);

    // 상태 필터 적용 (deploymentState 기준)
    if (statusFilter === 'deployed') {
      result = result.filter((w) => w.deploymentState === 'deployed');
    } else if (statusFilter === 'draft') {
      result = result.filter((w) => w.deploymentState !== 'deployed');
    }

    // 태그 필터 적용
    if (selectedTags.length > 0) {
      result = result.filter((w) =>
        selectedTags.some((tag) => w.tags?.includes(tag))
      );
    }

    return result;
  }, [workflows, filters, sortBy, statusFilter, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  };



  const handleOpenWorkflow = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  const handleNavigateDeployment = (workflowId: string) => {
    setSelectedBotIdForDeployment(workflowId);
    setIsDeploymentModalOpen(true);
  };

  const handleEditTags = (workflowId: string, currentTags: string[]) => {
    setEditingWorkflowId(workflowId);
    setEditingWorkflowTags(currentTags);
    setIsTagsDialogOpen(true);
  };

  const handleSaveTags = async (workflowId: string, tags: string[]) => {
    try {
      await updateWorkflow(workflowId, { tags });
      toast.success('태그가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast.error('태그 업데이트에 실패했습니다.');
      throw error;
    }
  };

  return (
    <>
      <div className="px-20 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Studio</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-2">Studio</h1>
            <p className="text-gray-600 text-sm">템플릿 기반 서비스를 한곳에서 모아 관리하고 배포해보세요.</p>
          </div>
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            새 서비스
          </button>
        </div>

        {/* Filters + Tag Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {statusFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  statusFilter === f.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tag Filter + Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1">
                {/* 검색 토글 */}
                <div className="relative flex items-center">
                  <div
                    className={cn(
                      'flex items-center overflow-hidden transition-all duration-300 ease-out',
                      isSearchExpanded ? 'w-72' : 'w-8'
                    )}
                  >
                    {isSearchExpanded ? (
                      <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            setFilters({ search: e.target.value });
                          }}
                          onBlur={() => {
                            if (!searchValue) {
                              setIsSearchExpanded(false);
                            }
                          }}
                          placeholder="서비스 검색..."
                          className="w-full h-8 pl-8 pr-8 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setSearchValue('');
                            setFilters({ search: '' });
                            setIsSearchExpanded(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setIsSearchExpanded(true)}
                              className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                                searchValue.length > 0
                                  ? 'text-gray-700'
                                  : 'text-gray-400 hover:text-gray-500'
                              )}
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>검색</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* 태그 필터 드롭다운 */}
                <TooltipProvider delayDuration={300}>
                  <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                              selectedTags.length > 0
                                ? 'text-gray-700'
                                : 'text-gray-400 hover:text-gray-500'
                            )}
                          >
                            <TagIcon className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{selectedTags.length > 0 ? `태그 (${selectedTags.length})` : '모든 태그'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* 태그 검색 */}
                      <div className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                          <input
                            type="text"
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            placeholder="태그 검색..."
                            className="w-full h-8 pl-8 pr-3 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {/* 태그 목록 */}
                      <div className="max-h-[320px] overflow-y-auto">
                        {allTags.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">태그 없음</div>
                        ) : filteredTags.length > 0 ? (
                          filteredTags.map((tag) => (
                            <DropdownMenuCheckboxItem
                              key={tag}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagToggle(tag)}
                            >
                              {tag}
                            </DropdownMenuCheckboxItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">검색 결과 없음</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>

            {/* 선택된 태그 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <span>{tag}</span>
                    <X className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-600">로딩 중...</div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
            <p className="text-sm">오류가 발생했습니다: {error.message}</p>
          </div>
        ) : (
          <WorkflowGrid
            workflows={filteredWorkflows}
            sortBy={sortBy}
            onOpenWorkflow={handleOpenWorkflow}
            onNavigateDeployment={handleNavigateDeployment}
            onEditTags={handleEditTags}
          />
        )}
      </div>

      <BotCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreateDialog}
        language={language}
        onSubmit={createBot}
        isCreating={isCreatingBot}
      />

      <BotTagsDialog
        open={isTagsDialogOpen}
        onOpenChange={setIsTagsDialogOpen}
        botId={editingWorkflowId}
        currentTags={editingWorkflowTags}
        onSave={handleSaveTags}
        language={language}
      />

      <DeploymentModal
        open={isDeploymentModalOpen}
        onOpenChange={setIsDeploymentModalOpen}
        botId={selectedBotIdForDeployment}
      />
    </>
  );
}
