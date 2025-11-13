// src/features/workflow/components/nodes/_base/NodePort.tsx

import type { PortDefinition } from '@shared/types/workflow';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { PortHandle } from './PortHandle';
import { PortTooltip } from './PortTooltip';
import { PortIndicator } from './PortIndicator';
import { cn } from '@shared/utils/cn';

interface NodePortProps {
  /** 포트 정의 */
  port: PortDefinition;

  /** 노드 ID */
  nodeId: string;

  /** 포트 방향 */
  direction: 'input' | 'output';

  /** 포트 인덱스 (여러 포트 중 위치) */
  index: number;

  /** 총 포트 수 */
  totalPorts: number;

  /** 연결 여부 */
  isConnected?: boolean;

  /** 현재 값 (디버깅용) */
  currentValue?: unknown;
}

/**
 * 노드 포트 컴포넌트
 * - 포트 시각화 (핸들, 라벨, 인디케이터)
 * - 포트 정보 툴팁
 * - 타입별 색상 표시
 */
export function NodePort({
  port,
  nodeId,
  direction,
  index,
  totalPorts,
  isConnected = false,
  currentValue,
}: NodePortProps) {
  const meta = PORT_TYPE_META[port.type];

  // 포트 위치 계산 (노드 높이를 기준으로 균등 배치)
  const positionPercentage = ((index + 1) / (totalPorts + 1)) * 100;

  return (
    <div
      className={cn(
        'absolute flex items-center',
        direction === 'input' ? 'left-0 flex-row' : 'right-0 flex-row-reverse'
      )}
      style={{
        top: `${positionPercentage}%`,
        transform: 'translateY(-50%)',
      }}
    >
      {/* React Flow Handle */}
      <PortHandle
        port={port}
        nodeId={nodeId}
        direction={direction}
        isConnected={isConnected}
      />

      {/* 포트 정보 (호버 시 표시) */}
      <PortTooltip port={port} currentValue={currentValue} direction={direction}>
        <div
          className={cn(
            'px-2 py-1 rounded text-xs font-medium transition-all group',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            direction === 'input' ? 'ml-2' : 'mr-2'
          )}
        >
          <div className="flex items-center gap-1">
            {/* 포트 표시명 */}
            <span className="text-gray-700 dark:text-gray-300">
              {port.display_name}
            </span>

            {/* 필수 표시 */}
            {port.required && <PortIndicator type="required" />}

            {/* 연결 상태 표시 */}
            {isConnected && <PortIndicator type="connected" />}
          </div>
        </div>
      </PortTooltip>
    </div>
  );
}
