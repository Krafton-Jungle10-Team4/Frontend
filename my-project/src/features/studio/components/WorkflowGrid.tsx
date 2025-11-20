import { useMemo, useState } from 'react';
import { WorkflowCard } from './WorkflowCard';
import { CreateAgentCard } from './CreateAgentCard';
import { VersionHistoryModal } from './VersionHistoryModal';
import { StudioDeploymentOptionsDialog } from './StudioDeploymentOptionsDialog';
import { EditWorkflowDialog } from './EditWorkflowDialog';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import { selectSortedWorkflows } from '@/features/studio/stores/selectors';
import type { Workflow, SortOption } from '@/shared/types/workflow';
import { toast } from 'sonner';

interface WorkflowGridProps {
  workflows: Workflow[];
  sortBy: SortOption;
  onCreateBlank: () => void;
  onCreateFromTemplate: () => void;
  onOpenWorkflow: (workflowId: string) => void;
  onNavigateDeployment?: (workflowId: string) => void;
}

export function WorkflowGrid({
  workflows,
  sortBy,
  onCreateBlank,
  onCreateFromTemplate,
  onOpenWorkflow,
  onNavigateDeployment,
}: WorkflowGridProps) {
  const { fetchWorkflows, publishToMarketplace, updateWorkflow, deleteWorkflow } = useWorkflowStore();
  const [versionHistoryModal, setVersionHistoryModal] = useState<{
    open: boolean;
    workflowId?: string;
  }>({
    open: false,
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    workflow?: Workflow;
  }>({ open: false });

  const handlePublish = async (workflow: Workflow) => {
    try {
      if (!workflow.latestVersionId) {
        toast.error('게시 가능한 버전이 없습니다.');
        return;
      }

      const config = {
        workflow_version_id: workflow.latestVersionId,
        display_name: workflow.name,
        description: workflow.description || '',
        category: workflow.category,
        tags: workflow.tags,
      };

      await publishToMarketplace(workflow.id, config);
      toast.success('마켓플레이스에 게시되었습니다.');
      await fetchWorkflows();
    } catch (error) {
      console.error('게시 실패:', error);
      toast.error('마켓플레이스 게시에 실패했습니다.');
    }
  };

  const sortedWorkflows = useMemo(
    () => selectSortedWorkflows(workflows, sortBy),
    [workflows, sortBy]
  );

  const handleVersionHistory = (workflowId: string) => {
    setVersionHistoryModal({ open: true, workflowId });
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
      <div
        className="gap-5"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        <CreateAgentCard
          onCreateBlank={onCreateBlank}
          onCreateFromTemplate={onCreateFromTemplate}
        />

        {sortedWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={() => onOpenWorkflow(workflow.id)}
              onDeploy={() => openDeploymentOptions(workflow)}
              onPublish={() => handlePublish(workflow)}
              onVersionHistory={() => handleVersionHistory(workflow.id)}
              onUpdate={() => handleUpdate(workflow)}
              onDelete={() => handleDelete(workflow)}
              onNavigateDeployment={() => onNavigateDeployment?.(workflow.id)}
            />
          ))}
      </div>

        <VersionHistoryModal
          open={versionHistoryModal.open}
          workflowId={versionHistoryModal.workflowId}
          onClose={() => setVersionHistoryModal({ open: false })}
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
    </>
  );
}
