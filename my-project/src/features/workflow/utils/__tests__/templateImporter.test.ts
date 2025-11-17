/**
 * 템플릿 Import 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import {
  createImportedNodeFromTemplate,
  isImportedNode,
  isNodeInTemplate,
  getParentTemplateId,
  addVariableNamespace,
  removeVariableNamespace,
  getChildNodeIds,
  getChildEdgeIds,
  toggleImportedNodeExpansion,
} from '../templateImporter';
import type { WorkflowTemplate } from '../../types/template.types';
import { BlockEnum } from '@/shared/types/workflow.types';

describe('templateImporter', () => {
  const createMockTemplate = (): WorkflowTemplate => ({
    id: 'tpl_abc123',
    name: 'Test Template',
    description: 'Test description',
    version: '1.0.0',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    author: {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
    },
    metadata: {
      tags: ['test'],
      category: 'test',
      visibility: 'private',
      source_workflow_id: 'wf_123',
      source_version_id: 'ver_123',
      node_count: 3,
      edge_count: 2,
      estimated_tokens: 100,
      estimated_cost: 0.01,
    },
    graph: {
      nodes: [
        {
          id: 'node1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { type: 'start', title: 'Start' },
        },
        {
          id: 'node2',
          type: 'llm',
          position: { x: 100, y: 0 },
          data: { type: 'llm', title: 'LLM' },
        },
        {
          id: 'node3',
          type: 'end',
          position: { x: 200, y: 0 },
          data: { type: 'end', title: 'End' },
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
        {
          id: 'edge2',
          source: 'node2',
          target: 'node3',
        },
      ],
    },
    input_schema: [
      {
        name: 'input',
        type: 'string',
        required: true,
        display_name: 'Input',
      },
    ],
    output_schema: [
      {
        name: 'output',
        type: 'string',
        required: true,
        display_name: 'Output',
      },
    ],
    thumbnail_url: null,
  });

  describe('createImportedNodeFromTemplate', () => {
    it('접힌 상태로 imported 노드를 생성해야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, false);

      expect(result.node.type).toBe('custom');
      expect(result.node.data.type).toBe(BlockEnum.ImportedWorkflow);
      expect(result.node.position).toEqual(position);
      expect(result.node.data.template_id).toBe('tpl_abc123');
      expect(result.node.data.is_expanded).toBe(false);
      expect(result.childNodes).toHaveLength(0);
      expect(result.childEdges).toHaveLength(0);
    });

    it('펼쳐진 상태로 imported 노드와 child 요소를 생성해야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, true);

      expect(result.node.type).toBe('custom');
      expect(result.node.data.type).toBe(BlockEnum.ImportedWorkflow);
      expect(result.node.data.is_expanded).toBe(true);
      expect(result.childNodes).toHaveLength(3);
      expect(result.childEdges).toHaveLength(2);
    });

    it('child 노드가 parent 노드를 참조해야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, true);

      result.childNodes.forEach((child) => {
        expect(child.parentNode).toBe(result.node.id);
        expect(child.extent).toBe('parent');
        expect(child.draggable).toBe(false);
        expect(child.connectable).toBe(false);
        expect(child.deletable).toBe(false);
      });
    });

    it('child 노드 ID가 올바르게 생성되어야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, true);

      const parentId = result.node.id;
      result.childNodes.forEach((child, index) => {
        const originalNodeId = template.graph.nodes[index].id;
        expect(child.id).toBe(`${parentId}_${originalNodeId}`);
      });
    });

    it('child 엣지 ID와 source/target이 올바르게 변환되어야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, true);

      const parentId = result.node.id;
      result.childEdges.forEach((edge, index) => {
        const originalEdge = template.graph.edges[index];
        expect(edge.id).toBe(`${parentId}_${originalEdge.id}`);
        expect(edge.source).toBe(`${parentId}_${originalEdge.source}`);
        expect(edge.target).toBe(`${parentId}_${originalEdge.target}`);
      });
    });

    it('잘못된 템플릿은 에러를 발생시켜야 함', () => {
      const invalidTemplate: any = {
        id: 'invalid',
        name: 'Invalid',
        // 필수 필드 누락
      };
      const position = { x: 0, y: 0 };

      expect(() => {
        createImportedNodeFromTemplate(invalidTemplate, position, false);
      }).toThrow();
    });

    it('템플릿 포트 정보가 노드 data에 포함되어야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, false);

      expect(result.node.data.ports.inputs).toEqual(template.input_schema);
      expect(result.node.data.ports.outputs).toEqual(template.output_schema);
    });

    it('child 노드의 position이 offset 되어야 함', () => {
      const template = createMockTemplate();
      const position = { x: 100, y: 100 };
      const result = createImportedNodeFromTemplate(template, position, true);

      result.childNodes.forEach((child, index) => {
        const originalNode = template.graph.nodes[index];
        expect(child.position.x).toBe(originalNode.position.x + 50);
        expect(child.position.y).toBe(originalNode.position.y + 50);
      });
    });
  });

  describe('isImportedNode', () => {
    it('imported 노드를 올바르게 식별해야 함', () => {
      const node: Node = {
        id: 'test',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { type: BlockEnum.ImportedWorkflow },
      };

      expect(isImportedNode(node)).toBe(true);
    });

    it('일반 노드는 false를 반환해야 함', () => {
      const node: Node = {
        id: 'test',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { type: BlockEnum.LLM },
      };

      expect(isImportedNode(node)).toBe(false);
    });

    it('type이 custom이 아니면 false를 반환해야 함', () => {
      const node: Node = {
        id: 'test',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
      };

      expect(isImportedNode(node)).toBe(false);
    });
  });

  describe('isNodeInTemplate', () => {
    it('템플릿 내부 노드를 올바르게 식별해야 함', () => {
      const node: Node = {
        id: 'imported_tpl_abc123_1234567890123_node1',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
        parentNode: 'imported_tpl_abc123_1234567890123',
      };

      expect(isNodeInTemplate(node)).toBe(true);
    });

    it('일반 노드는 false를 반환해야 함', () => {
      const node: Node = {
        id: 'node1',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
      };

      expect(isNodeInTemplate(node)).toBe(false);
    });

    it('parentNode가 있지만 imported_ 접두사가 없으면 false', () => {
      const node: Node = {
        id: 'child_node',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
        parentNode: 'some_parent',
      };

      expect(isNodeInTemplate(node)).toBe(false);
    });
  });

  describe('getParentTemplateId', () => {
    it('underscore를 포함한 템플릿 ID를 올바르게 추출해야 함', () => {
      const node: Node = {
        id: 'imported_tpl_abc123_1234567890123_node1',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
        parentNode: 'imported_tpl_abc123_1234567890123',
      };

      const templateId = getParentTemplateId(node);
      expect(templateId).toBe('tpl_abc123');
    });

    it('복잡한 템플릿 ID도 올바르게 추출해야 함', () => {
      const node: Node = {
        id: 'imported_tpl_complex_id_with_many_underscores_1234567890123_node1',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
        parentNode: 'imported_tpl_complex_id_with_many_underscores_1234567890123',
      };

      const templateId = getParentTemplateId(node);
      expect(templateId).toBe('tpl_complex_id_with_many_underscores');
    });

    it('템플릿 내부 노드가 아니면 null 반환', () => {
      const node: Node = {
        id: 'regular_node',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
      };

      const templateId = getParentTemplateId(node);
      expect(templateId).toBeNull();
    });

    it('잘못된 형식의 ID는 null 반환', () => {
      const node: Node = {
        id: 'imported_invalid',
        type: 'llm',
        position: { x: 0, y: 0 },
        data: {},
        parentNode: 'something',
      };

      const templateId = getParentTemplateId(node);
      expect(templateId).toBeNull();
    });
  });

  describe('addVariableNamespace', () => {
    it('변수명에 namespace를 추가해야 함', () => {
      const result = addVariableNamespace('myVar', 'tpl_123');
      expect(result).toBe('template_tpl_123_myVar');
    });

    it('underscore가 포함된 템플릿 ID도 처리해야 함', () => {
      const result = addVariableNamespace('myVar', 'tpl_abc_123');
      expect(result).toBe('template_tpl_abc_123_myVar');
    });
  });

  describe('removeVariableNamespace', () => {
    it('namespace를 제거해야 함', () => {
      const result = removeVariableNamespace('template_tpl_123_myVar', 'tpl_123');
      expect(result).toBe('myVar');
    });

    it('underscore가 포함된 템플릿 ID도 처리해야 함', () => {
      const result = removeVariableNamespace('template_tpl_abc_123_myVar', 'tpl_abc_123');
      expect(result).toBe('myVar');
    });

    it('namespace가 없으면 원본 반환', () => {
      const result = removeVariableNamespace('myVar', 'tpl_123');
      expect(result).toBe('myVar');
    });

    it('다른 템플릿의 namespace는 제거하지 않음', () => {
      const result = removeVariableNamespace('template_tpl_456_myVar', 'tpl_123');
      expect(result).toBe('template_tpl_456_myVar');
    });
  });

  describe('getChildNodeIds', () => {
    it('imported 노드의 모든 child 노드 ID를 반환해야 함', () => {
      const parentId = 'imported_tpl_123_1234567890123';
      const nodes: Node[] = [
        {
          id: parentId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { type: BlockEnum.ImportedWorkflow }
        },
        {
          id: `${parentId}_node1`,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { type: BlockEnum.Start },
          parentNode: parentId,
        },
        {
          id: `${parentId}_node2`,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { type: BlockEnum.LLM },
          parentNode: parentId,
        },
        { id: 'other_node', type: 'custom', position: { x: 0, y: 0 }, data: { type: BlockEnum.LLM } },
      ];

      const childIds = getChildNodeIds(parentId, nodes);
      expect(childIds).toHaveLength(2);
      expect(childIds).toContain(`${parentId}_node1`);
      expect(childIds).toContain(`${parentId}_node2`);
      expect(childIds).not.toContain('other_node');
    });

    it('child가 없으면 빈 배열 반환', () => {
      const parentId = 'imported_tpl_123_1234567890123';
      const nodes: Node[] = [
        {
          id: parentId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { type: BlockEnum.ImportedWorkflow }
        },
      ];

      const childIds = getChildNodeIds(parentId, nodes);
      expect(childIds).toHaveLength(0);
    });
  });

  describe('getChildEdgeIds', () => {
    it('imported 노드의 모든 child 엣지 ID를 반환해야 함', () => {
      const parentId = 'imported_tpl_123_1234567890123';
      const edges: Edge[] = [
        { id: `${parentId}_edge1`, source: 'a', target: 'b' },
        { id: `${parentId}_edge2`, source: 'b', target: 'c' },
        { id: 'other_edge', source: 'x', target: 'y' },
      ];

      const childIds = getChildEdgeIds(parentId, edges);
      expect(childIds).toHaveLength(2);
      expect(childIds).toContain(`${parentId}_edge1`);
      expect(childIds).toContain(`${parentId}_edge2`);
      expect(childIds).not.toContain('other_edge');
    });

    it('child가 없으면 빈 배열 반환', () => {
      const parentId = 'imported_tpl_123_1234567890123';
      const edges: Edge[] = [{ id: 'other_edge', source: 'x', target: 'y' }];

      const childIds = getChildEdgeIds(parentId, edges);
      expect(childIds).toHaveLength(0);
    });
  });

  describe('toggleImportedNodeExpansion', () => {
    it('펼치기 시 child 요소를 생성해야 함', () => {
      const template = createMockTemplate();
      const nodeId = 'imported_tpl_123_1234567890123';
      const result = toggleImportedNodeExpansion(nodeId, true, template);

      expect(result.childNodes).toHaveLength(3);
      expect(result.childEdges).toHaveLength(2);
    });

    it('접기 시 빈 배열을 반환해야 함', () => {
      const template = createMockTemplate();
      const nodeId = 'imported_tpl_123_1234567890123';
      const result = toggleImportedNodeExpansion(nodeId, false, template);

      expect(result.childNodes).toHaveLength(0);
      expect(result.childEdges).toHaveLength(0);
    });

    it('펼칠 때 child 노드가 올바른 parentNode를 가져야 함', () => {
      const template = createMockTemplate();
      const nodeId = 'imported_tpl_123_1234567890123';
      const result = toggleImportedNodeExpansion(nodeId, true, template);

      result.childNodes.forEach((child) => {
        expect(child.parentNode).toBe(nodeId);
      });
    });
  });
});
