// src/shared/types/workflow/node.types.ts

import { NodePortSchema } from './port.types';
import { NodeVariableMappings } from './variable.types';
import { PortType } from './port.types';

/**
 * 워크플로우 노드 (V2 확장)
 */
export interface WorkflowNodeV2 {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;

  /** V2: 포트 스키마 */
  ports?: NodePortSchema;

  /** V2: 변수 매핑 */
  variable_mappings?: NodeVariableMappings;
}

/**
 * 워크플로우 엣지 (V2 확장)
 */
export interface WorkflowEdgeV2 {
  id: string;
  source: string;
  target: string;

  /** V2: 소스 포트 이름 */
  source_port?: string;

  /** V2: 타겟 포트 이름 */
  target_port?: string;

  /** V2: 데이터 타입 */
  data_type?: PortType;
}
