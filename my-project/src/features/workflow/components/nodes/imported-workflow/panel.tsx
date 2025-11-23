/**
 * ImportedWorkflowNode Config Panel (읽기 전용)
 */
import { memo } from 'react';
import { Lock, X } from 'lucide-react';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import type { ImportedWorkflowNodeData } from '../../../types/import-node.types';
import { useWorkflowStore } from '../../../stores/workflowStore';

interface ImportedWorkflowPanelProps {
  data: ImportedWorkflowNodeData;
}

export const ImportedWorkflowPanel = memo(
  ({ data }: ImportedWorkflowPanelProps) => {
  const { selectNode } = useWorkflowStore();

  return (
    <div className="space-y-4 p-4 relative">
      {/* 닫기 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => selectNode(null)}
        title="패널 닫기"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Read-Only Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">읽기 전용 라이브러리 서비스</p>
          <p className="text-xs text-muted-foreground">
            라이브러리에서 가져온 서비스는 이 자리에서 편집할 수 없습니다.
          </p>
        </div>
      </div>

      <Separator />

      {/* Template Info */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            서비스 이름
          </label>
          <p className="text-sm mt-1">{data.template_name || '알 수 없음'}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            버전
          </label>
          <Badge
            variant="outline"
            className="font-mono bg-green-700 dark:bg-green-800 text-white border-green-800 dark:border-green-700"
          >
            {data.template_version || 'v1.0.0'}
          </Badge>
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
        <div className="space-y-4">
          {data.ports.inputs && data.ports.inputs.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                입력 포트
              </label>
              <div className="space-y-2">
                {data.ports.inputs.map((input) => (
                  <div
                    key={input.name}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-gray-100 dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{input.name}</span>
                    <Badge
                      variant="outline"
                      className="font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                    >
                      {input.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.ports.outputs && data.ports.outputs.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                출력 포트
              </label>
              <div className="space-y-2">
                {data.ports.outputs.map((output) => (
                  <div
                    key={output.name}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-gray-100 dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{output.name}</span>
                    <Badge
                      variant="outline"
                      className="font-mono bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                    >
                      {output.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ImportedWorkflowPanel.displayName = 'ImportedWorkflowPanel';
