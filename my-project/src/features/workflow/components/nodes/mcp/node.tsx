/**
 * MCP 워크플로우 노드 컴포넌트
 */
import type { NodeProps, MCPNodeType } from '@/shared/types/workflow.types';

/**
 * MCP 노드
 * 외부 MCP 서비스 연동
 */
const MCPNode = ({ data }: NodeProps<MCPNodeType>) => {
  const providerName = data.provider_id
    ? data.provider_id.replace(/-/g, ' ').toUpperCase()
    : 'Not Configured';

  return (
    <div className="px-3 py-1">
      {/* Provider 정보 */}
      {data.provider_id && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            PROVIDER
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {providerName}
          </div>
        </div>
      )}

      {/* Action 정보 */}
      {data.action && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            ACTION
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {data.action}
          </div>
        </div>
      )}

      {/* Parameters 정보 */}
      {data.parameters && Object.keys(data.parameters).length > 0 && (
        <div>
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            PARAMETERS
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5">
            {Object.keys(data.parameters).length}개 설정됨
          </div>
        </div>
      )}

      {/* 미설정 상태 */}
      {!data.provider_id && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          Provider를 선택해주세요
        </div>
      )}
    </div>
  );
};

export default MCPNode;
