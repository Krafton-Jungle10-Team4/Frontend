/**
 * 포트 스키마 추출 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import {
  extractInputSchema,
  extractOutputSchema,
  extractPortSchemas,
  validatePortDefinition,
  validatePortSchema,
} from '../portSchemaExtractor';
import type { PortDefinition } from '../../types/template.types';

describe('portSchemaExtractor', () => {
  describe('extractInputSchema', () => {
    it('Start 노드에서 입력 스키마를 추출해야 함', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            type: 'start',
            ports: {
              outputs: {
                query: {
                  type: 'string',
                  required: true,
                  label: 'Query',
                  description: 'Search query',
                },
                context: {
                  type: 'object',
                  required: false,
                  label: 'Context',
                },
              },
            },
          },
        },
      ];

      const schema = extractInputSchema(nodes);

      expect(schema).toHaveLength(2);
      expect(schema[0].name).toBe('query');
      expect(schema[0].type).toBe('string');
      expect(schema[0].required).toBe(true);
      expect(schema[1].name).toBe('context');
      expect(schema[1].required).toBe(false);
    });

    it('outputs 속성 대신 data.outputs를 사용할 수 있어야 함', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            type: 'start',
            outputs: {
              input: {
                type: 'string',
                required: true,
              },
            },
          },
        },
      ];

      const schema = extractInputSchema(nodes);

      expect(schema).toHaveLength(1);
      expect(schema[0].name).toBe('input');
    });

    it('Start 노드가 없으면 빈 배열 반환', () => {
      const nodes: Node[] = [
        {
          id: 'llm',
          type: 'llm',
          position: { x: 0, y: 0 },
          data: { type: 'llm' },
        },
      ];

      const schema = extractInputSchema(nodes);
      expect(schema).toHaveLength(0);
    });

    it('포트 데이터가 없으면 빈 배열 반환', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { type: 'start' },
        },
      ];

      const schema = extractInputSchema(nodes);
      expect(schema).toHaveLength(0);
    });

    it('display_name이 label 또는 display_name에서 추출되어야 함', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            type: 'start',
            ports: {
              outputs: {
                port1: { type: 'string', label: 'Port Label' },
                port2: { type: 'string', display_name: 'Port Display' },
                port3: { type: 'string' },
              },
            },
          },
        },
      ];

      const schema = extractInputSchema(nodes);

      expect(schema[0].display_name).toBe('Port Label');
      expect(schema[1].display_name).toBe('Port Display');
      expect(schema[2].display_name).toBe('port3'); // fallback to name
    });

    it('default_value가 default 또는 default_value에서 추출되어야 함', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            type: 'start',
            ports: {
              outputs: {
                port1: { type: 'string', default: 'default1' },
                port2: { type: 'string', default_value: 'default2' },
              },
            },
          },
        },
      ];

      const schema = extractInputSchema(nodes);

      expect(schema[0].default_value).toBe('default1');
      expect(schema[1].default_value).toBe('default2');
    });
  });

  describe('extractOutputSchema', () => {
    it('End 노드에서 출력 스키마를 추출해야 함', () => {
      const nodes: Node[] = [
        {
          id: 'end',
          type: 'end',
          position: { x: 0, y: 0 },
          data: {
            type: 'end',
            ports: {
              inputs: {
                result: {
                  type: 'string',
                  required: true,
                  label: 'Result',
                },
              },
            },
          },
        },
      ];

      const schema = extractOutputSchema(nodes);

      expect(schema).toHaveLength(1);
      expect(schema[0].name).toBe('result');
      expect(schema[0].type).toBe('string');
    });

    it('Answer 노드에서도 출력 스키마를 추출해야 함', () => {
      const nodes: Node[] = [
        {
          id: 'answer',
          type: 'answer',
          position: { x: 0, y: 0 },
          data: {
            type: 'answer',
            ports: {
              inputs: {
                answer: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        },
      ];

      const schema = extractOutputSchema(nodes);

      expect(schema).toHaveLength(1);
      expect(schema[0].name).toBe('answer');
    });

    it('End/Answer 노드가 없으면 빈 배열 반환', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { type: 'start' },
        },
      ];

      const schema = extractOutputSchema(nodes);
      expect(schema).toHaveLength(0);
    });

    it('여러 End 노드가 있으면 첫 번째 것을 사용해야 함', () => {
      const nodes: Node[] = [
        {
          id: 'end1',
          type: 'end',
          position: { x: 0, y: 0 },
          data: {
            type: 'end',
            ports: {
              inputs: {
                output1: { type: 'string' },
              },
            },
          },
        },
        {
          id: 'end2',
          type: 'end',
          position: { x: 100, y: 0 },
          data: {
            type: 'end',
            ports: {
              inputs: {
                output2: { type: 'number' },
              },
            },
          },
        },
      ];

      const schema = extractOutputSchema(nodes);

      expect(schema).toHaveLength(1);
      expect(schema[0].name).toBe('output1');
    });
  });

  describe('extractPortSchemas', () => {
    it('전체 포트 스키마를 추출해야 함', () => {
      const nodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            type: 'start',
            ports: {
              outputs: {
                input: { type: 'string' },
              },
            },
          },
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 100, y: 0 },
          data: {
            type: 'end',
            ports: {
              inputs: {
                output: { type: 'string' },
              },
            },
          },
        },
      ];

      const schemas = extractPortSchemas(nodes);

      expect(schemas.input_schema).toHaveLength(1);
      expect(schemas.output_schema).toHaveLength(1);
      expect(schemas.input_schema[0].name).toBe('input');
      expect(schemas.output_schema[0].name).toBe('output');
    });
  });

  describe('validatePortDefinition', () => {
    it('유효한 포트 정의를 통과해야 함', () => {
      const port: PortDefinition = {
        name: 'test_port',
        type: 'string',
        required: true,
        display_name: 'Test Port',
      };

      const result = validatePortDefinition(port);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('빈 포트 이름은 에러 반환', () => {
      const port: PortDefinition = {
        name: '',
        type: 'string',
        required: true,
        display_name: 'Test',
      };

      const result = validatePortDefinition(port);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('이름'))).toBe(true);
    });

    it('공백만 있는 포트 이름은 에러 반환', () => {
      const port: PortDefinition = {
        name: '   ',
        type: 'string',
        required: true,
        display_name: 'Test',
      };

      const result = validatePortDefinition(port);

      expect(result.valid).toBe(false);
    });

    it('유효하지 않은 타입은 에러 반환', () => {
      const port: PortDefinition = {
        name: 'test',
        type: 'invalid_type' as any,
        required: true,
        display_name: 'Test',
      };

      const result = validatePortDefinition(port);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('타입'))).toBe(true);
    });

    it('required가 boolean이 아니면 에러 반환', () => {
      const port: any = {
        name: 'test',
        type: 'string',
        required: 'true',
        display_name: 'Test',
      };

      const result = validatePortDefinition(port);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('boolean'))).toBe(true);
    });

    it('모든 유효한 타입을 허용해야 함', () => {
      const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'any', 'file', 'array_file'];

      validTypes.forEach((type) => {
        const port: PortDefinition = {
          name: 'test',
          type: type as any,
          required: true,
          display_name: 'Test',
        };

        const result = validatePortDefinition(port);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validatePortSchema', () => {
    it('유효한 포트 스키마 배열을 통과해야 함', () => {
      const ports: PortDefinition[] = [
        {
          name: 'port1',
          type: 'string',
          required: true,
          display_name: 'Port 1',
        },
        {
          name: 'port2',
          type: 'number',
          required: false,
          display_name: 'Port 2',
        },
      ];

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('중복된 포트 이름을 검출해야 함', () => {
      const ports: PortDefinition[] = [
        {
          name: 'duplicate',
          type: 'string',
          required: true,
          display_name: 'Port 1',
        },
        {
          name: 'duplicate',
          type: 'number',
          required: false,
          display_name: 'Port 2',
        },
      ];

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('중복'))).toBe(true);
    });

    it('개별 포트 검증 에러를 포함해야 함', () => {
      const ports: PortDefinition[] = [
        {
          name: '',
          type: 'string',
          required: true,
          display_name: 'Invalid',
        },
        {
          name: 'valid',
          type: 'invalid_type' as any,
          required: true,
          display_name: 'Invalid Type',
        },
      ];

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('빈 배열도 유효해야 함', () => {
      const ports: PortDefinition[] = [];
      const result = validatePortSchema(ports);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('여러 에러를 모두 수집해야 함', () => {
      const ports: PortDefinition[] = [
        {
          name: '',
          type: 'invalid' as any,
          required: 'not_boolean' as any,
          display_name: 'Bad Port 1',
        },
        {
          name: 'port2',
          type: 'string',
          required: true,
          display_name: 'Good Port',
        },
        {
          name: 'port2',
          type: 'number',
          required: true,
          display_name: 'Duplicate',
        },
      ];

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('에러 메시지에 포트 인덱스를 포함해야 함', () => {
      const ports: PortDefinition[] = [
        {
          name: '',
          type: 'string',
          required: true,
          display_name: 'Invalid',
        },
      ];

      const result = validatePortSchema(ports);

      expect(result.errors.some((e) => e.includes('[0]'))).toBe(true);
    });

    it('대량의 포트도 처리할 수 있어야 함', () => {
      const ports: PortDefinition[] = Array.from({ length: 50 }, (_, i) => ({
        name: `port${i}`,
        type: 'string',
        required: true,
        display_name: `Port ${i}`,
      }));

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(true);
    });

    it('중복 검사가 모든 포트에 대해 수행되어야 함', () => {
      const ports: PortDefinition[] = [
        { name: 'a', type: 'string', required: true, display_name: 'A' },
        { name: 'b', type: 'string', required: true, display_name: 'B' },
        { name: 'a', type: 'string', required: true, display_name: 'A duplicate' },
        { name: 'c', type: 'string', required: true, display_name: 'C' },
        { name: 'b', type: 'string', required: true, display_name: 'B duplicate' },
      ];

      const result = validatePortSchema(ports);

      expect(result.valid).toBe(false);
      const duplicateErrors = result.errors.filter((e) => e.includes('중복'));
      expect(duplicateErrors.length).toBe(2);
    });
  });
});
