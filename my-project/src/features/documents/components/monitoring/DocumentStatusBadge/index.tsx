import React from 'react';
import { Badge } from '@/shared/components/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip';
import { DocumentStatus } from '../../../types/document.types';
import { DOCUMENT_STATUS_CONFIG } from '../../../constants/documentConstants';
import { Loader2, Info } from 'lucide-react';
import styles from './DocumentStatusBadge.module.css';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  errorMessage?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  errorMessage,
}) => {
  const config = DOCUMENT_STATUS_CONFIG[status];

  const getIcon = () => {
    if (status === DocumentStatus.PROCESSING) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    return <span className={styles.statusIcon}>{config.icon}</span>;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={config.color as any}
        className={config.animated ? styles.animated : ''}
      >
        {getIcon()}
        <span className="ml-1">{config.label}</span>
      </Badge>

      {status === DocumentStatus.FAILED && errorMessage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-destructive cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{errorMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
