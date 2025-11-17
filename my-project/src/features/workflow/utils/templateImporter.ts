/**
 * 템플릿 Import 유틸리티
 */
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowTemplate } from '../types/template.types';
import { validateTemplate } from './templateValidator';

/**
 * 템플릿을 ImportedWorkflowNode로 변환
 */
export function createImportedNodeFromTemplate(
  template: WorkflowTemplate,
  position: { x: number; y: number },
  isExpanded: boolean = false
): { node: Node; childNodes: Node[]; childEdges: Edge[] } {
  // 검증
  const validation = validateTemplate(template);
  if (!validation.valid) {
    throw new Error(`템플릿 검증 실패: ${validation.errors.join(', ')}`);
  }

  const nodeId = `imported_${template.id}_${Date.now()}`;

  // 부모 노드 생성 (ImportedWorkflowNode)
  const parentNode: Node = {
    id: nodeId,
    type: 'imported-workflow',
    position,
    data: {
      type: 'imported-workflow',
      title: template.name,
      desc: template.description,
      template_id: template.id,
      template_name: template.name,
      template_version: template.version,
      is_expanded: isExpanded,
      read_only: true,
      internal_graph: template.graph,
      ports: {
        inputs: template.input_schema,
        outputs: template.output_schema,
      },
      variable_mappings: {},
    },
  };

  // Child 노드 생성 (내부 워크플로우) - Expanded 시에만
  const childNodes: Node[] = [];
  const childEdges: Edge[] = [];

  if (isExpanded) {
    template.graph.nodes.forEach((node) => {
      const childNode: Node = {
        ...node,
        id: `${nodeId}_${node.id}`,
        position: {
          x: node.position.x + 50, // 부모 내부 offset
          y: node.position.y + 50,
        },
        parentNode: nodeId,
        extent: 'parent' as const,
        draggable: false,
        connectable: false,
        deletable: false,
        selectable: true, // 선택은 가능 (읽기 전용 확인용)
        style: {
          ...node.style,
          opacity: 0.8,
          filter: 'grayscale(10%)',
        },
      };
      childNodes.push(childNode);
    });

    template.graph.edges.forEach((edge) => {
      const childEdge: Edge = {
        ...edge,
        id: `${nodeId}_${edge.id}`,
        source: `${nodeId}_${edge.source}`,
        target: `${nodeId}_${edge.target}`,
      };
      childEdges.push(childEdge);
    });
  }

  return { node: parentNode, childNodes, childEdges };
}

/**
 * Imported 노드인지 확인
 */
export function isImportedNode(node: Node): boolean {
  return node.type === 'imported-workflow';
}

/**
 * 노드가 템플릿 내부 노드인지 확인
 */
export function isNodeInTemplate(node: Node): boolean {
  return Boolean(node.parentNode && node.id.startsWith('imported_'));
}

/**
 * 템플릿 내부 노드의 부모 템플릿 ID 추출
 */
export function getParentTemplateId(node: Node): string | null {
  if (!isNodeInTemplate(node)) {
    return null;
  }

  // ID 형식: imported_{template_id}_{timestamp}_{original_node_id}
  const match = node.id.match(/^imported_([^_]+)_\d+/);
  return match ? match[1] : null;
}

/**
 * 변수 이름에 namespace prefix 추가
 */
export function addVariableNamespace(
  variableName: string,
  templateId: string
): string {
  return `template_${templateId}_${variableName}`;
}

/**
 * 변수 이름에서 namespace prefix 제거
 */
export function removeVariableNamespace(
  namespacedVariable: string,
  templateId: string
): string {
  const prefix = `template_${templateId}_`;
  if (namespacedVariable.startsWith(prefix)) {
    return namespacedVariable.slice(prefix.length);
  }
  return namespacedVariable;
}

/**
 * Imported 노드의 모든 하위 노드 ID 목록 가져오기
 */
export function getChildNodeIds(importedNodeId: string, allNodes: Node[]): string[] {
  return allNodes
    .filter((node) => node.parentNode === importedNodeId)
    .map((node) => node.id);
}

/**
 * Imported 노드의 모든 하위 엣지 ID 목록 가져오기
 */
export function getChildEdgeIds(importedNodeId: string, allEdges: Edge[]): string[] {
  return allEdges
    .filter((edge) => edge.id.startsWith(`${importedNodeId}_`))
    .map((edge) => edge.id);
}

/**
 * Imported 노드를 펼치거나 접을 때 하위 요소 표시 여부 토글
 */
export function toggleImportedNodeExpansion(
  importedNodeId: string,
  isExpanded: boolean,
  template: WorkflowTemplate
): { childNodes: Node[]; childEdges: Edge[] } {
  if (!isExpanded) {
    // 접힌 상태 → 하위 요소 제거
    return { childNodes: [], childEdges: [] };
  }

  // 펼친 상태 → 하위 요소 생성
  const childNodes: Node[] = [];
  const childEdges: Edge[] = [];

  template.graph.nodes.forEach((node) => {
    const childNode: Node = {
      ...node,
      id: `${importedNodeId}_${node.id}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      parentNode: importedNodeId,
      extent: 'parent' as const,
      draggable: false,
      connectable: false,
      deletable: false,
      selectable: true,
      style: {
        ...node.style,
        opacity: 0.8,
        filter: 'grayscale(10%)',
      },
    };
    childNodes.push(childNode);
  });

  template.graph.edges.forEach((edge) => {
    const childEdge: Edge = {
      ...edge,
      id: `${importedNodeId}_${edge.id}`,
      source: `${importedNodeId}_${edge.source}`,
      target: `${importedNodeId}_${edge.target}`,
    };
    childEdges.push(childEdge);
  });

  return { childNodes, childEdges };
}
