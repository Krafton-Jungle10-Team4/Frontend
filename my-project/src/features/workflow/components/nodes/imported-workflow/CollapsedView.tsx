/**
 * CollapsedView - 축소된 상태의 에이전트 노드
 */
import { memo } from 'react';
import { FileText } from 'lucide-react';
import type { CollapsedViewProps } from '../../../types/import-node.types';
import { Badge } from '@/shared/components/badge';

export const CollapsedView = memo(({ ports, description }: CollapsedViewProps) => {
  // 방어 로직: ports가 없거나 비어있는 경우 처리
  const hasInputs = ports?.inputs && Array.isArray(ports.inputs) && ports.inputs.length > 0;
  const hasOutputs = ports?.outputs && Array.isArray(ports.outputs) && ports.outputs.length > 0;

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
          {hasInputs ? (
            ports.inputs.map((input) => (
              <div
                key={input.name}
                className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-muted/50"
              >
                <span className="font-mono px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                  {input.display_name || input.name}
                </span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {input.type}
                </Badge>
                {input.required && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic py-1 px-2">
              입력 포트 없음
            </p>
          )}
        </div>
      </div>

      {/* Output Ports */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">출력</p>
        <div className="space-y-1">
          {hasOutputs ? (
            ports.outputs.map((output) => (
              <div
                key={output.name}
                className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-muted/50"
              >
                <span className="font-mono px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                  {output.display_name || output.name}
                </span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {output.type}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic py-1 px-2">
              출력 포트 없음
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

CollapsedView.displayName = 'CollapsedView';
