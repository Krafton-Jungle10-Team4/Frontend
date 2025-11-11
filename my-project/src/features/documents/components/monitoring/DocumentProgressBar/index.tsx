import React from 'react';
import { Progress } from '@/shared/components/progress';
import { DocumentWithStatus, DocumentStatus } from '../../../types/document.types';

interface DocumentProgressBarProps {
  document: DocumentWithStatus;
}

export const DocumentProgressBar: React.FC<DocumentProgressBarProps> = ({ document }) => {
  const getProgress = (): number => {
    switch (document.status) {
      case DocumentStatus.UPLOADED:
      case DocumentStatus.QUEUED:
        return 0;
      case DocumentStatus.PROCESSING:
        // 임의 진행률 (실제로는 Backend에서 제공해야 함)
        return 50;
      case DocumentStatus.DONE:
        return 100;
      case DocumentStatus.FAILED:
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress();

  if (document.status === DocumentStatus.FAILED) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={progress} className="h-2 flex-1" />
      <span className="text-xs text-muted-foreground min-w-[3ch] text-right">
        {progress}%
      </span>
    </div>
  );
};
