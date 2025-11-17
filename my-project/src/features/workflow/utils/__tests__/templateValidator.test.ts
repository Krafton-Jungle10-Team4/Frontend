/**
 * 템플릿 검증 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  validateTemplateStructure,
  validateBusinessRules,
  validateTemplate,
} from '../templateValidator';
import type { WorkflowTemplate } from '../../types/template.types';

describe('templateValidator', () => {
  const createValidTemplate = (): WorkflowTemplate => ({
    id: 'tpl_test123',
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

  describe('validateTemplateStructure', () => {
    it('유효한 템플릿 구조를 검증해야 함', () => {
      const template = createValidTemplate();
      const result = validateTemplateStructure(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('필수 필드 누락 시 에러 반환', () => {
      const invalidTemplate = {
        id: 'tpl_123',
        name: 'Test',
        // version 필드 누락
      };

      const result = validateTemplateStructure(invalidTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('잘못된 version 형식 시 에러 반환', () => {
      const template = createValidTemplate();
      template.version = 'invalid-version';

      const result = validateTemplateStructure(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('version'))).toBe(true);
    });

    it('name 길이 제한 검증', () => {
      const template = createValidTemplate();
      template.name = ''; // 빈 문자열

      const result = validateTemplateStructure(template);

      expect(result.valid).toBe(false);
    });

    it('잘못된 visibility 값 시 에러 반환', () => {
      const template: any = createValidTemplate();
      template.metadata.visibility = 'invalid';

      const result = validateTemplateStructure(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('visibility'))).toBe(true);
    });
  });

  describe('validateBusinessRules', () => {
    it('유효한 비즈니스 규칙을 통과해야 함', () => {
      const template = createValidTemplate();
      const result = validateBusinessRules(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('Start 노드 없으면 에러 반환', () => {
      const template = createValidTemplate();
      template.graph.nodes = template.graph.nodes.filter(
        (n: any) => n.data?.type !== 'start'
      );

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Start'))).toBe(true);
    });

    it('End/Answer 노드 없으면 에러 반환', () => {
      const template = createValidTemplate();
      template.graph.nodes = template.graph.nodes.filter(
        (n: any) => !['end', 'answer'].includes(n.data?.type)
      );

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('End'))).toBe(true);
    });

    it('노드 개수 최소 제한 검증', () => {
      const template = createValidTemplate();
      template.graph.nodes = [
        {
          id: 'node1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { type: 'start', title: 'Start' },
        },
      ];
      template.metadata.node_count = 1;

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('최소'))).toBe(true);
    });

    it('노드 개수 최대 제한 검증', () => {
      const template = createValidTemplate();
      // 최대 제한을 초과하는 노드 생성
      const manyNodes = Array.from({ length: 101 }, (_, i) => ({
        id: `node${i}`,
        type: 'llm',
        position: { x: i * 100, y: 0 },
        data: { type: i === 0 ? 'start' : i === 100 ? 'end' : 'llm', title: `Node ${i}` },
      }));
      template.graph.nodes = manyNodes;
      template.metadata.node_count = manyNodes.length;

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('초과'))).toBe(true);
    });

    it('엣지 개수 최대 제한 검증', () => {
      const template = createValidTemplate();
      // 최대 제한을 초과하는 엣지 생성
      const manyEdges = Array.from({ length: 201 }, (_, i) => ({
        id: `edge${i}`,
        source: 'node1',
        target: 'node2',
      }));
      template.graph.edges = manyEdges;
      template.metadata.edge_count = manyEdges.length;

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('초과'))).toBe(true);
    });

    it('지원하지 않는 노드 타입 검출', () => {
      const template = createValidTemplate();
      template.graph.nodes.push({
        id: 'invalid',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { type: 'unsupported-type', title: 'Invalid' },
      } as any);

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('지원하지 않는'))).toBe(true);
    });

    it('입력 포트 스키마 없으면 에러 반환', () => {
      const template = createValidTemplate();
      template.input_schema = [];

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('입력 포트'))).toBe(true);
    });

    it('메타데이터 node_count 불일치 검출', () => {
      const template = createValidTemplate();
      template.metadata.node_count = 999; // 실제와 다른 값

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('node_count'))).toBe(true);
    });

    it('메타데이터 edge_count 불일치 검출', () => {
      const template = createValidTemplate();
      template.metadata.edge_count = 999; // 실제와 다른 값

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('edge_count'))).toBe(true);
    });

    it('Answer 노드를 End 노드로 인식해야 함', () => {
      const template = createValidTemplate();
      template.graph.nodes[2].data.type = 'answer';

      const result = validateBusinessRules(template);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateTemplate', () => {
    it('전체 검증을 수행해야 함', () => {
      const template = createValidTemplate();
      const result = validateTemplate(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('구조 검증 실패 시 비즈니스 규칙 검증하지 않음', () => {
      const invalidTemplate = {
        id: 'test',
        // 필수 필드 대부분 누락
      };

      const result = validateTemplate(invalidTemplate);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('구조는 유효하지만 비즈니스 규칙 위반 시 에러 반환', () => {
      const template = createValidTemplate();
      template.graph.nodes = []; // Start 노드 없음
      template.metadata.node_count = 0;

      const result = validateTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('복합 오류 시나리오 처리', () => {
      const template = createValidTemplate();
      // 여러 규칙 위반
      template.graph.nodes = template.graph.nodes.filter(
        (n: any) => n.data?.type !== 'start'
      ); // Start 노드 없음
      template.input_schema = []; // 입력 스키마 없음
      template.metadata.node_count = 999; // 개수 불일치

      const result = validateTemplate(template);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2); // 여러 에러
    });
  });
});
