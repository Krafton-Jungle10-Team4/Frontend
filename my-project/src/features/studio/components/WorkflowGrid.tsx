import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workflow, SortOption, WorkflowVersion } from '@/shared/types/workflow';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import { selectSortedWorkflows } from '@/features/studio/stores/selectors';
import { WorkflowCard } from './WorkflowCard';
import { CreateAgentCard } from './CreateAgentCard';
import { VersionHistoryModal } from './VersionHistoryModal';

interface WorkflowGridProps {
  workflows: Workflow[];
  sortBy: SortOption;
}

interface VersionHistoryModalState {
  open: boolean;
  workflowId?: string;
  versions: WorkflowVersion[];
}

export function WorkflowGrid({ workflows, sortBy }: WorkflowGridProps) {
  const navigate = useNavigate();
  const { deployWorkflow, publishToMarketplace, fetchVersionHistory } = useWorkflowStore();
  const [versionHistoryModal, setVersionHistoryModal] = useState<VersionHistoryModalState>({
    open: false,
    versions: [],
  });

  const handleCreateBlank = () => {
    navigate('/studio/create');
  };

  const handleCreateFromTemplate = () => {
    navigate('/studio/templates');
  };

  const handleMenuAction = (workflowId: string, action: string) => {
    console.log('Menu action:', action, 'for workflow:', workflowId);
  };

  const sortedWorkflows = useMemo(
    () => selectSortedWorkflows(workflows, sortBy),
    [workflows, sortBy]
  );

  useEffect(() => {
    if (versionHistoryModal.open && versionHistoryModal.workflowId) {
      void fetchVersionHistory(versionHistoryModal.workflowId).then((versions) => {
        setVersionHistoryModal((prev) => ({
          ...prev,
          versions,
        }));
      });
    }
  }, [versionHistoryModal.open, versionHistoryModal.workflowId, fetchVersionHistory]);

  const handleVersionHistory = (workflowId: string) => {
    setVersionHistoryModal({ open: true, workflowId, versions: [] });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <CreateAgentCard
          onCreateBlank={handleCreateBlank}
          onCreateFromTemplate={handleCreateFromTemplate}
        />

        {sortedWorkflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onEdit={() => navigate(`/studio/workflow/${workflow.id}`)}
            onDeploy={() => deployWorkflow(workflow.id, { workflow_version_id: workflow.latestVersion })}
            onPublish={() => publishToMarketplace(workflow.id, { workflow_version_id: workflow.latestVersion })}
            onVersionHistory={() => handleVersionHistory(workflow.id)}
            onMenuAction={(action) => handleMenuAction(workflow.id, action)}
          />
        ))}
      </div>

      <VersionHistoryModal
        open={versionHistoryModal.open}
        workflowId={versionHistoryModal.workflowId}
        versions={versionHistoryModal.versions}
        onClose={() => setVersionHistoryModal({ open: false, versions: [] })}
        onOpenVersion={(version) => navigate(`/studio/workflow/${versionHistoryModal.workflowId}/version/${version.id}`)}
      />
    </>
  );
}
