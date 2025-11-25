import { useMemo, useState } from 'react';
import { WorkflowCard } from './WorkflowCard';
import { VersionHistoryModal } from '@/features/deployment/components/VersionHistoryModal';
import { StudioDeploymentOptionsDialog } from './StudioDeploymentOptionsDialog';
import { EditWorkflowDialog } from './EditWorkflowDialog';
import { BotVersionSelectorDialog } from './BotVersionSelectorDialog';
import { MarketplacePublishDialog } from '@/features/library/components/MarketplacePublishDialog';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import { selectSortedWorkflows } from '@/features/studio/stores/selectors';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import type { Workflow, SortOption } from '@/shared/types/workflow';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { toast } from 'sonner';

interface WorkflowGridProps {
  workflows: Workflow[];
  sortBy: SortOption;
  onOpenWorkflow: (workflowId: string) => void;
  onNavigateDeployment?: (workflowId: string) => void;
  onEditTags?: (workflowId: string, currentTags: string[]) => void;
}

export function WorkflowGrid({
  workflows,
  sortBy,
  onOpenWorkflow,
  onNavigateDeployment,
  onEditTags,
}: WorkflowGridProps) {
  const { fetchWorkflows, publishToMarketplace, updateWorkflow, deleteWorkflow } = useWorkflowStore();
  const [versionHistoryModal, setVersionHistoryModal] = useState<{
    open: boolean;
    botId?: string;
    botName?: string;
  }>({
    open: false,
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    workflow?: Workflow;
  }>({ open: false });

  const [versionSelectorDialog, setVersionSelectorDialog] = useState(false);
  const [currentWorkflowForPublish, setCurrentWorkflowForPublish] = useState<Workflow | null>(null);
  const [publishDialog, setPublishDialog] = useState<{
    open: boolean;
    agent?: LibraryAgentVersion;
  }>({ open: false });

  const handlePublish = async (workflow: Workflow) => {
    try {
      setCurrentWorkflowForPublish(workflow);

      // 최신 게시 버전 조회
      const publishedVersions = await workflowApi.listWorkflowVersions(workflow.id, {
        status: 'published',
      });

      if (publishedVersions.length === 0) {
        toast.error('게시할 버전이 없습니다', {
          description: '먼저 워크플로우를 커밋하여 버전을 생성하세요.',
        });
        return;
      }

      // 최신 버전(첫 번째)
      const latestVersion = publishedVersions[0];

      // 버전 상세 정보 조회
      const versionDetail = await workflowApi.getWorkflowVersionDetail(workflow.id, latestVersion.id);

      // LibraryAgentVersion 형태로 변환
      const agentVersion: LibraryAgentVersion = {
        id: latestVersion.id,
        bot_id: workflow.id,
        version: versionDetail.version || '1.0',
        status: 'published',
        created_at: versionDetail.created_at || new Date().toISOString(),
        updated_at: versionDetail.updated_at || new Date().toISOString(),
        library_name: workflow.name,
        library_description: workflow.description,
        library_category: workflow.category,
        library_tags: workflow.tags || [],
        library_visibility: 'public',
        is_in_library: false,
        library_published_at: new Date().toISOString(),
        node_count: versionDetail.node_count || 0,
        edge_count: versionDetail.edge_count || 0,
      };

      // 바로 MarketplacePublishDialog 열기
      setPublishDialog({ open: true, agent: agentVersion });
    } catch (error) {
      console.error('버전 정보 조회 실패:', error);
      toast.error('버전 정보를 가져오는데 실패했습니다.');
    }
  };

  const handleVersionSelected = async (botId: string, versionId: string, botName: string) => {
    try {
      // 선택된 버전의 상세 정보 조회
      const versionDetail = await workflowApi.getWorkflowVersionDetail(botId, versionId);

      // LibraryAgentVersion 형태로 변환
      const agentVersion: LibraryAgentVersion = {
        id: versionId,
        bot_id: botId,
        version: versionDetail.version || '1.0',
        status: 'published',
        created_at: versionDetail.created_at || new Date().toISOString(),
        updated_at: versionDetail.updated_at || new Date().toISOString(),
        library_name: currentWorkflowForPublish?.name || botName,
        library_description: currentWorkflowForPublish?.description,
        library_category: currentWorkflowForPublish?.category,
        library_tags: currentWorkflowForPublish?.tags || [],
        library_visibility: 'public',
        is_in_library: false,
        library_published_at: new Date().toISOString(),
        node_count: versionDetail.node_count || 0,
        edge_count: versionDetail.edge_count || 0,
      };

      setPublishDialog({ open: true, agent: agentVersion });
    } catch (error) {
      console.error('버전 상세 정보 조회 실패:', error);
      toast.error('버전 정보를 가져오는데 실패했습니다.');
    }
  };

  const sortedWorkflows = useMemo(
    () => selectSortedWorkflows(workflows, sortBy),
    [workflows, sortBy]
  );

  const handleVersionHistory = (workflow: Workflow) => {
    setVersionHistoryModal({
      open: true,
      botId: workflow.id,
      botName: workflow.name
    });
  };

  const [deploymentDialog, setDeploymentDialog] = useState<{
    open: boolean;
    workflow?: Workflow;
  }>({ open: false });

  const openDeploymentOptions = (workflow: Workflow) => {
    setDeploymentDialog({ open: true, workflow });
  };

  const handleUpdate = (workflow: Workflow) => {
    setEditDialog({ open: true, workflow });
  };

  const handleSaveUpdate = async (data: { name: string; description: string }) => {
    if (!editDialog.workflow) return;

    try {
      await updateWorkflow(editDialog.workflow.id, {
        name: data.name,
        description: data.description,
      });
      toast.success('워크플로우가 수정되었습니다.');
      await fetchWorkflows();
    } catch (error) {
      console.error('워크플로우 수정 실패:', error);
      toast.error('워크플로우 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    try {
      await deleteWorkflow(workflow.id);
      toast.success('워크플로우가 삭제되었습니다.');
    } catch (error) {
      console.error('워크플로우 삭제 실패:', error);
      toast.error('워크플로우 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={() => onOpenWorkflow(workflow.id)}
              onDeploy={() => openDeploymentOptions(workflow)}
              onPublish={() => handlePublish(workflow)}
              onVersionHistory={() => handleVersionHistory(workflow)}
              onUpdate={() => handleUpdate(workflow)}
              onDelete={() => handleDelete(workflow)}
              onNavigateDeployment={() => onNavigateDeployment?.(workflow.id)}
              onEditTags={onEditTags}
            />
          ))}
      </div>

        <VersionHistoryModal
          open={versionHistoryModal.open}
          onOpenChange={(open) => setVersionHistoryModal({ open })}
          botId={versionHistoryModal.botId || ''}
          botName={versionHistoryModal.botName}
        />
        <StudioDeploymentOptionsDialog
          open={deploymentDialog.open}
          workflow={deploymentDialog.workflow}
          onOpenChange={(open) =>
            setDeploymentDialog((prev) => ({
              open,
              workflow: open ? prev.workflow : undefined,
            }))
          }
        />

        {editDialog.workflow && (
          <EditWorkflowDialog
            open={editDialog.open}
            onOpenChange={(open) =>
              setEditDialog((prev) => ({
                open,
                workflow: open ? prev.workflow : undefined,
              }))
            }
            workflow={editDialog.workflow}
            onSave={handleSaveUpdate}
          />
        )}

        <BotVersionSelectorDialog
          open={versionSelectorDialog}
          onOpenChange={setVersionSelectorDialog}
          onSelect={handleVersionSelected}
          initialBotId={currentWorkflowForPublish?.id}
          initialBotName={currentWorkflowForPublish?.name}
        />

        {publishDialog.agent && (
          <MarketplacePublishDialog
            open={publishDialog.open}
            onOpenChange={(open) =>
              setPublishDialog((prev) => ({
                open,
                agent: open ? prev.agent : undefined,
              }))
            }
            agent={publishDialog.agent}
          />
        )}
    </>
  );
}
