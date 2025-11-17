/**
 * CollapsedView - 축소된 상태의 템플릿 노드
 */
import { memo } from 'react';
import { FileText } from 'lucide-react';
import type { CollapsedViewProps } from '../../../types/import-node.types';
import { Badge } from '@/shared/components/badge';

export const CollapsedView = memo(({ ports, description }: CollapsedViewProps) => {
  return (
    <div className="p-3 space-y-3">
      {/* Description */}
      {description && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{description}</p>
        </div>
      )}

      {/* Input Ports */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">입력</p>
        <div className="space-y-1">
          {ports.inputs.map((input) => (
            <div
              key={input.name}
              className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-muted/50"
            >
              <span className="font-mono">{input.display_name || input.name}</span>
              <Badge variant="outline" className="text-xs">
                {input.type}
              </Badge>
              {input.required && (
                <span className="text-red-500 text-xs">*</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Output Ports */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">출력</p>
        <div className="space-y-1">
          {ports.outputs.map((output) => (
            <div
              key={output.name}
              className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-muted/50"
            >
              <span className="font-mono">{output.display_name || output.name}</span>
              <Badge variant="outline" className="text-xs">
                {output.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CollapsedView.displayName = 'CollapsedView';
