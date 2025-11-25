import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { WorkflowGrid } from '@/features/studio/components/WorkflowGrid';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import { selectFilteredAndSortedWorkflows } from '@/features/studio/stores/selectors';
import { useBotCreateDialog } from '@/features/bot/hooks/useBotCreateDialog';
import { BotCreateDialog } from '@/features/bot/components/BotCreateDialog';
import { BotTagsDialog } from '@/features/bot/components/BotTagsDialog';
import { useUIStore } from '@/shared/stores/uiStore';
import { toast } from 'sonner';
import { cn } from '@/shared/components/utils';

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

  // 태그 편집 다이얼로그 상태
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string>('');
  const [editingWorkflowTags, setEditingWorkflowTags] = useState<string[]>([]);


  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  const filteredWorkflows = useMemo(() => {
    let result = selectFilteredAndSortedWorkflows(workflows, filters, sortBy);

    // 상태 필터 적용 (deploymentState 기준)
    if (statusFilter === 'deployed') {
      result = result.filter((w) => w.deploymentState === 'deployed');
    } else if (statusFilter === 'draft') {
      result = result.filter((w) => w.deploymentState !== 'deployed');
    }

    return result;
  }, [workflows, filters, sortBy, statusFilter]);



  const handleOpenWorkflow = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  const handleNavigateDeployment = (workflowId: string) => {
    navigate(`/workspace/deployment/${workflowId}`);
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
        <div className="mb-8">
          <h1 className="text-2xl mb-2">Studio</h1>
          <p className="text-gray-600 text-sm">템플릿 기반 서비스를 한곳에서 모아 관리하고 배포해보세요.</p>
        </div>

        {/* Filters + New Service Button */}
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
          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            새 서비스
          </button>
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
    </>
  );
}
