/**
 * ImportedWorkflowNode 전용 타입 정의
 */
import type { TemplateGraph, PortDefinition } from './template.types';

/**
 * ImportedWorkflowNode 데이터 구조
 */
export interface ImportedWorkflowNodeData {
  // 기본 노드 정보
  type: 'imported-workflow';
  title: string;
  desc?: string;

  // 템플릿 정보
  template_id: string;
  template_name: string;
  template_version: string;

  // 상태
  is_expanded: boolean;
  read_only: true; // 항상 true

  // 내부 그래프
  internal_graph: TemplateGraph;

  // 포트 (외부 연결용)
  ports: {
    inputs: PortDefinition[];
    outputs: PortDefinition[];
  };

  // 변수 매핑 (외부 → 내부)
  variable_mappings: Record<string, string>;
}

/**
 * Collapsed 상태 props
 */
export interface CollapsedViewProps {
  ports: {
    inputs: PortDefinition[];
    outputs: PortDefinition[];
  };
  description?: string;
}

/**
 * Expanded 상태 props
 */
export interface ExpandedViewProps {
  nodeId: string;
  internalGraph: TemplateGraph;
  templateId: string;
}
