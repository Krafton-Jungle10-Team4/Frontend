// src/features/workflow/utils/__tests__/variableResolver.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseVariablePath,
  buildVariablePath,
  resolveVariableValue,
  resolveMultipleVariables,
  isValidVariablePath,
  variableExists,
  extractNodeId,
  extractPortName,
} from '../variableResolver';
import { useVariablePoolStore } from '../../stores/variablePoolStore';
import { PortType } from '@shared/types/workflow';

describe('variableResolver', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useVariablePoolStore.getState().clearAllOutputs();
  });

  describe('parseVariablePath', () => {
    it('유효한 경로 파싱', () => {
      const result = parseVariablePath('knowledge_1.documents');

      expect(result).toEqual({
        nodeId: 'knowledge_1',
        portName: 'documents',
      });
    });

    it('다양한 형식의 유효한 경로', () => {
      expect(parseVariablePath('start_1.user_message')).toEqual({
        nodeId: 'start_1',
        portName: 'user_message',
      });

      expect(parseVariablePath('llm_node_123.response')).toEqual({
        nodeId: 'llm_node_123',
        portName: 'response',
      });

      expect(parseVariablePath('a.b')).toEqual({
        nodeId: 'a',
        portName: 'b',
      });
    });

    it('잘못된 경로는 null 반환', () => {
      expect(parseVariablePath('invalid')).toBeNull();
      expect(parseVariablePath('too.many.parts')).toBeNull();
      expect(parseVariablePath('a.b.c.d')).toBeNull();
    });

    it('빈 문자열은 null 반환', () => {
      expect(parseVariablePath('')).toBeNull();
    });

    it('빈 노드 ID 또는 포트 이름은 null 반환', () => {
      expect(parseVariablePath('.portName')).toBeNull();
      expect(parseVariablePath('nodeId.')).toBeNull();
      expect(parseVariablePath('.')).toBeNull();
    });
  });

  describe('buildVariablePath', () => {
    it('변수 경로 생성', () => {
      const path = buildVariablePath('knowledge_1', 'documents');

      expect(path).toBe('knowledge_1.documents');
    });

    it('다양한 입력으로 경로 생성', () => {
      expect(buildVariablePath('start_1', 'user_message')).toBe(
        'start_1.user_message'
      );
      expect(buildVariablePath('llm', 'response')).toBe('llm.response');
      expect(buildVariablePath('a', 'b')).toBe('a.b');
    });
  });

  describe('resolveVariableValue', () => {
    it('ValueSelector를 값으로 해석', () => {
      const store = useVariablePoolStore.getState();
      store.setNodeOutput('knowledge_1', 'documents', ['doc1', 'doc2']);

      const selector = {
        variable: 'knowledge_1.documents',
        value_type: PortType.ARRAY,
      };

      const value = resolveVariableValue(selector);

      expect(value).toEqual(['doc1', 'doc2']);
    });

    it('존재하지 않는 변수는 undefined 반환', () => {
      const selector = {
        variable: 'nonexistent.output',
        value_type: PortType.STRING,
      };

      const value = resolveVariableValue(selector);

      expect(value).toBeUndefined();
    });

    it('다양한 타입의 값 해석', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'string_val', 'text');
      store.setNodeOutput('node1', 'number_val', 42);
      store.setNodeOutput('node1', 'boolean_val', true);
      store.setNodeOutput('node1', 'object_val', { key: 'value' });

      expect(
        resolveVariableValue({
          variable: 'node1.string_val',
          value_type: PortType.STRING,
        })
      ).toBe('text');

      expect(
        resolveVariableValue({
          variable: 'node1.number_val',
          value_type: PortType.NUMBER,
        })
      ).toBe(42);

      expect(
        resolveVariableValue({
          variable: 'node1.boolean_val',
          value_type: PortType.BOOLEAN,
        })
      ).toBe(true);

      expect(
        resolveVariableValue({
          variable: 'node1.object_val',
          value_type: PortType.OBJECT,
        })
      ).toEqual({ key: 'value' });
    });
  });

  describe('resolveMultipleVariables', () => {
    it('여러 변수를 한 번에 해석', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('start_1', 'user_message', '안녕하세요');
      store.setNodeOutput('knowledge_1', 'context', 'context data');
      store.setNodeOutput('llm_1', 'response', 'AI 응답');

      const selectors = [
        { variable: 'start_1.user_message', value_type: PortType.STRING },
        { variable: 'knowledge_1.context', value_type: PortType.STRING },
        { variable: 'llm_1.response', value_type: PortType.STRING },
      ];

      const values = resolveMultipleVariables(selectors);

      expect(values).toEqual(['안녕하세요', 'context data', 'AI 응답']);
    });

    it('존재하지 않는 변수는 undefined로 반환', () => {
      const store = useVariablePoolStore.getState();
      store.setNodeOutput('node1', 'port1', 'value1');

      const selectors = [
        { variable: 'node1.port1', value_type: PortType.STRING },
        { variable: 'nonexistent.port', value_type: PortType.STRING },
        { variable: 'node1.port2', value_type: PortType.STRING },
      ];

      const values = resolveMultipleVariables(selectors);

      expect(values).toEqual(['value1', undefined, undefined]);
    });

    it('빈 배열은 빈 배열 반환', () => {
      const values = resolveMultipleVariables([]);

      expect(values).toEqual([]);
    });
  });

  describe('isValidVariablePath', () => {
    it('유효한 경로 검증', () => {
      expect(isValidVariablePath('knowledge_1.documents')).toBe(true);
      expect(isValidVariablePath('start_1.user_message')).toBe(true);
      expect(isValidVariablePath('a.b')).toBe(true);
    });

    it('유효하지 않은 경로 검증', () => {
      expect(isValidVariablePath('invalid')).toBe(false);
      expect(isValidVariablePath('too.many.parts')).toBe(false);
      expect(isValidVariablePath('')).toBe(false);
      expect(isValidVariablePath('.')).toBe(false);
      expect(isValidVariablePath('.port')).toBe(false);
      expect(isValidVariablePath('node.')).toBe(false);
    });
  });

  describe('variableExists', () => {
    it('존재하는 변수 확인', () => {
      const store = useVariablePoolStore.getState();
      store.setNodeOutput('start_1', 'user_message', '안녕하세요');

      expect(variableExists('start_1.user_message')).toBe(true);
    });

    it('존재하지 않는 변수 확인', () => {
      expect(variableExists('nonexistent.output')).toBe(false);
    });

    it('잘못된 경로는 false 반환', () => {
      expect(variableExists('invalid')).toBe(false);
      expect(variableExists('too.many.parts')).toBe(false);
    });

    it('null 값도 존재하는 것으로 간주', () => {
      const store = useVariablePoolStore.getState();
      store.setNodeOutput('node1', 'port1', null);

      expect(variableExists('node1.port1')).toBe(true);
    });
  });

  describe('extractNodeId', () => {
    it('변수 경로에서 노드 ID 추출', () => {
      expect(extractNodeId('knowledge_1.documents')).toBe('knowledge_1');
      expect(extractNodeId('start_1.user_message')).toBe('start_1');
      expect(extractNodeId('a.b')).toBe('a');
    });

    it('잘못된 경로는 null 반환', () => {
      expect(extractNodeId('invalid')).toBeNull();
      expect(extractNodeId('too.many.parts')).toBeNull();
      expect(extractNodeId('')).toBeNull();
    });
  });

  describe('extractPortName', () => {
    it('변수 경로에서 포트 이름 추출', () => {
      expect(extractPortName('knowledge_1.documents')).toBe('documents');
      expect(extractPortName('start_1.user_message')).toBe('user_message');
      expect(extractPortName('a.b')).toBe('b');
    });

    it('잘못된 경로는 null 반환', () => {
      expect(extractPortName('invalid')).toBeNull();
      expect(extractPortName('too.many.parts')).toBeNull();
      expect(extractPortName('')).toBeNull();
    });
  });

  describe('통합 시나리오', () => {
    it('전체 변수 흐름 테스트', () => {
      const store = useVariablePoolStore.getState();

      // 1. 변수 경로 생성
      const path1 = buildVariablePath('start_1', 'user_message');
      const path2 = buildVariablePath('knowledge_1', 'documents');

      expect(path1).toBe('start_1.user_message');
      expect(path2).toBe('knowledge_1.documents');

      // 2. 경로 검증
      expect(isValidVariablePath(path1)).toBe(true);
      expect(isValidVariablePath(path2)).toBe(true);

      // 3. 값 저장
      store.setNodeOutput('start_1', 'user_message', '안녕하세요');
      store.setNodeOutput('knowledge_1', 'documents', ['doc1', 'doc2']);

      // 4. 변수 존재 확인
      expect(variableExists(path1)).toBe(true);
      expect(variableExists(path2)).toBe(true);

      // 5. 경로 파싱
      const parsed1 = parseVariablePath(path1);
      const parsed2 = parseVariablePath(path2);

      expect(parsed1).toEqual({
        nodeId: 'start_1',
        portName: 'user_message',
      });
      expect(parsed2).toEqual({
        nodeId: 'knowledge_1',
        portName: 'documents',
      });

      // 6. 노드 ID/포트 이름 추출
      expect(extractNodeId(path1)).toBe('start_1');
      expect(extractPortName(path1)).toBe('user_message');

      // 7. 값 해석
      const value1 = resolveVariableValue({
        variable: path1,
        value_type: PortType.STRING,
      });
      const value2 = resolveVariableValue({
        variable: path2,
        value_type: PortType.ARRAY,
      });

      expect(value1).toBe('안녕하세요');
      expect(value2).toEqual(['doc1', 'doc2']);
    });
  });
});
