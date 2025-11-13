// src/features/workflow/components/nodes/_base/PortHandle.tsx

import { Handle, Position } from '@xyflow/react';
import type { PortDefinition } from '@shared/types/workflow';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';

interface PortHandleProps {
  port: PortDefinition;
  nodeId: string;
  direction: 'input' | 'output';
  isConnected: boolean;
}

/**
 * React Flow Handle 확장 컴포넌트
 * - 포트 메타데이터 포함
 * - 타입별 색상 표시
 * - 연결 상태 반영
 */
export function PortHandle({
  port,
  nodeId,
  direction,
  isConnected,
}: PortHandleProps) {
  const meta = PORT_TYPE_META[port.type];

  // React Flow Handle 설정
  const handleType = direction === 'input' ? 'target' : 'source';
  const handlePosition = direction === 'input' ? Position.Left : Position.Right;

  // 포트 고유 ID (React Flow가 엣지 연결 시 사용)
  const handleId = port.name;

  return (
    <Handle
      type={handleType}
      position={handlePosition}
      id={handleId}
      className={cn(
        'w-3 h-3 border-2 transition-all',
        '!bg-white dark:!bg-gray-900',
        // 타입별 색상
        isConnected ? meta.color.replace('text-', 'border-') : 'border-gray-300',
        // Hover 효과
        'hover:scale-125 hover:border-4',
        // 커서
        'cursor-crosshair'
      )}
      // React Flow에 포트 메타데이터 전달 (커스텀 data 속성)
      data-port-name={port.name}
      data-port-type={port.type}
      data-port-required={port.required}
      data-node-id={nodeId}
      data-direction={direction}
    />
  );
}
