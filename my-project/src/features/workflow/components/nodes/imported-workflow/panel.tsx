/**
 * ImportedWorkflowNode Config Panel (읽기 전용)
 */
import { memo } from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Separator } from '@/shared/components/separator';
import type { ImportedWorkflowNodeData } from '../../../types/import-node.types';

interface ImportedWorkflowPanelProps {
  data: ImportedWorkflowNodeData;
}

export const ImportedWorkflowPanel = memo(
  ({ data }: ImportedWorkflowPanelProps) => {
  return (
    <div className="space-y-4 p-4">
      {/* Read-Only Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">읽기 전용 라이브러리 에이전트</p>
          <p className="text-xs text-muted-foreground">
            라이브러리에서 가져온 에이전트는 이 자리에서 편집할 수 없습니다.
          </p>
        </div>
      </div>

      <Separator />

      {/* Template Info */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            에이전트 이름
          </label>
          <p className="text-sm mt-1">{data.template_name || '알 수 없음'}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            버전
          </label>
          <p className="text-sm mt-1">
            <Badge variant="outline">{data.template_version || 'v1.0.0'}</Badge>
          </p>
        </div>

        {data.desc && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              설명
            </label>
            <p className="text-sm mt-1 text-muted-foreground">{data.desc}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Ports */}
      {data.ports && (
        <div className="space-y-3">
          {data.ports.inputs && data.ports.inputs.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                입력 포트
              </label>
              <div className="space-y-1 mt-1">
                {data.ports.inputs.map((input) => (
                  <div
                    key={input.name}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                  >
                    <span className="font-mono">{input.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {input.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.ports.outputs && data.ports.outputs.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                출력 포트
              </label>
              <div className="space-y-1 mt-1">
                {data.ports.outputs.map((output) => (
                  <div
                    key={output.name}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                  >
                    <span className="font-mono">{output.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {output.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Actions */}
      {data.template_id && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleViewTemplate}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          에이전트 상세 보기
        </Button>
      )}
    </div>
  );
});

ImportedWorkflowPanel.displayName = 'ImportedWorkflowPanel';
