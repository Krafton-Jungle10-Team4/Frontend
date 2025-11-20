import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog';
import type { WorkflowVersion } from '@/shared/types/workflow';

interface VersionHistoryModalProps {
  open: boolean;
  workflowId?: string;
  versions?: WorkflowVersion[];
  onClose: () => void;
  onOpenVersion?: (version: WorkflowVersion) => void;
}

export function VersionHistoryModal({ open, workflowId, versions = [], onClose, onOpenVersion }: VersionHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>버전 히스토리</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {workflowId && versions.length === 0 && (
            <p className="text-sm text-muted-foreground">현재 워크플로우에는 저장된 버전 기록이 없습니다.</p>
          )}
          {versions.map((version) => (
            <button
              key={version.id}
              className="w-full rounded-sharp border border-studio-card-border p-3 text-left hover:bg-studio-tag-bg/40"
              onClick={() => onOpenVersion?.(version)}
            >
              <p className="font-semibold">v{version.version}</p>
              {version.description && <p className="text-sm text-muted-foreground">{version.description}</p>}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
