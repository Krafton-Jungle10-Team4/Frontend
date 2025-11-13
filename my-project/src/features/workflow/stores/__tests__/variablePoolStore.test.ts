// src/features/workflow/stores/__tests__/variablePoolStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { useVariablePoolStore } from '../variablePoolStore';
import { PortType } from '@shared/types/workflow';

describe('variablePoolStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useVariablePoolStore.getState().clearAllOutputs();
    useVariablePoolStore.getState().setEnvironmentVariables({});
    useVariablePoolStore.getState().setConversationVariables({});
  });

  describe('setNodeOutput / getNodeOutput', () => {
    it('노드 출력 저장 및 조회', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'output1', 'test value');

      expect(store.getNodeOutput('node1', 'output1')).toBe('test value');
    });

    it('여러 포트 출력 저장', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node1', 'port2', 'value2');
      store.setNodeOutput('node1', 'port3', 'value3');

      expect(store.getNodeOutput('node1', 'port1')).toBe('value1');
      expect(store.getNodeOutput('node1', 'port2')).toBe('value2');
      expect(store.getNodeOutput('node1', 'port3')).toBe('value3');
    });

    it('존재하지 않는 출력은 undefined 반환', () => {
      const store = useVariablePoolStore.getState();

      expect(store.getNodeOutput('nonexistent', 'port')).toBeUndefined();
    });

    it('다양한 타입의 값 저장', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'string', 'text');
      store.setNodeOutput('node1', 'number', 42);
      store.setNodeOutput('node1', 'boolean', true);
      store.setNodeOutput('node1', 'array', [1, 2, 3]);
      store.setNodeOutput('node1', 'object', { key: 'value' });
      store.setNodeOutput('node1', 'null', null);

      expect(store.getNodeOutput('node1', 'string')).toBe('text');
      expect(store.getNodeOutput('node1', 'number')).toBe(42);
      expect(store.getNodeOutput('node1', 'boolean')).toBe(true);
      expect(store.getNodeOutput('node1', 'array')).toEqual([1, 2, 3]);
      expect(store.getNodeOutput('node1', 'object')).toEqual({ key: 'value' });
      expect(store.getNodeOutput('node1', 'null')).toBeNull();
    });
  });

  describe('hasNodeOutput', () => {
    it('출력 존재 확인', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value');

      expect(store.hasNodeOutput('node1', 'port1')).toBe(true);
      expect(store.hasNodeOutput('node1', 'port2')).toBe(false);
      expect(store.hasNodeOutput('node2', 'port1')).toBe(false);
    });

    it('null 값도 존재하는 것으로 간주', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', null);

      expect(store.hasNodeOutput('node1', 'port1')).toBe(true);
    });
  });

  describe('getAllNodeOutputs', () => {
    it('노드의 모든 출력 반환', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node1', 'port2', 'value2');
      store.setNodeOutput('node1', 'port3', 'value3');

      const outputs = store.getAllNodeOutputs('node1');

      expect(outputs).toEqual({
        port1: 'value1',
        port2: 'value2',
        port3: 'value3',
      });
    });

    it('존재하지 않는 노드는 빈 객체 반환', () => {
      const store = useVariablePoolStore.getState();

      const outputs = store.getAllNodeOutputs('nonexistent');

      expect(outputs).toEqual({});
    });
  });

  describe('clearAllOutputs', () => {
    it('모든 출력 초기화', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node2', 'port2', 'value2');

      store.clearAllOutputs();

      expect(store.nodeOutputs).toEqual({});
      expect(store.getNodeOutput('node1', 'port1')).toBeUndefined();
      expect(store.getNodeOutput('node2', 'port2')).toBeUndefined();
    });
  });

  describe('clearNodeOutputs', () => {
    it('특정 노드 출력만 제거', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node2', 'port2', 'value2');

      store.clearNodeOutputs('node1');

      expect(store.getNodeOutput('node1', 'port1')).toBeUndefined();
      expect(store.getNodeOutput('node2', 'port2')).toBe('value2');
    });
  });

  describe('resolveValueSelector', () => {
    it('ValueSelector를 값으로 해석', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('knowledge_1', 'documents', ['doc1', 'doc2']);

      const selector = {
        variable: 'knowledge_1.documents',
        value_type: PortType.ARRAY,
      };

      const resolved = store.resolveValueSelector(selector);

      expect(resolved).toEqual(['doc1', 'doc2']);
    });

    it('존재하지 않는 변수는 undefined 반환', () => {
      const store = useVariablePoolStore.getState();

      const selector = {
        variable: 'nonexistent.output',
        value_type: PortType.STRING,
      };

      const resolved = store.resolveValueSelector(selector);

      expect(resolved).toBeUndefined();
    });
  });

  describe('resolveVariablePath', () => {
    it('변수 경로를 값으로 해석', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('knowledge_1', 'documents', ['doc1', 'doc2']);

      const resolved = store.resolveVariablePath('knowledge_1.documents');

      expect(resolved).toEqual(['doc1', 'doc2']);
    });

    it('잘못된 경로는 undefined 반환', () => {
      const store = useVariablePoolStore.getState();

      expect(store.resolveVariablePath('invalid')).toBeUndefined();
      expect(store.resolveVariablePath('too.many.parts')).toBeUndefined();
    });

    it('빈 경로는 undefined 반환', () => {
      const store = useVariablePoolStore.getState();

      expect(store.resolveVariablePath('')).toBeUndefined();
    });
  });

  describe('환경 변수 관리', () => {
    it('환경 변수 설정 및 조회', () => {
      const store = useVariablePoolStore.getState();

      store.setEnvironmentVariable('API_KEY', 'secret');

      expect(store.getEnvironmentVariable('API_KEY')).toBe('secret');
    });

    it('여러 환경 변수 일괄 설정', () => {
      const store = useVariablePoolStore.getState();

      store.setEnvironmentVariables({
        API_KEY: 'secret',
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7,
      });

      expect(store.getEnvironmentVariable('API_KEY')).toBe('secret');
      expect(store.getEnvironmentVariable('MAX_TOKENS')).toBe(1000);
      expect(store.getEnvironmentVariable('TEMPERATURE')).toBe(0.7);
    });

    it('존재하지 않는 환경 변수는 undefined 반환', () => {
      const store = useVariablePoolStore.getState();

      expect(store.getEnvironmentVariable('NONEXISTENT')).toBeUndefined();
    });
  });

  describe('대화 변수 관리', () => {
    it('대화 변수 설정 및 조회', () => {
      const store = useVariablePoolStore.getState();

      store.setConversationVariable('sessionId', 'session-123');

      expect(store.getConversationVariable('sessionId')).toBe('session-123');
    });

    it('여러 대화 변수 일괄 설정', () => {
      const store = useVariablePoolStore.getState();

      store.setConversationVariables({
        sessionId: 'session-123',
        userId: 'user-456',
        chatId: 'chat-789',
      });

      expect(store.getConversationVariable('sessionId')).toBe('session-123');
      expect(store.getConversationVariable('userId')).toBe('user-456');
      expect(store.getConversationVariable('chatId')).toBe('chat-789');
    });
  });

  describe('getSnapshot', () => {
    it('전체 상태 스냅샷 반환', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setEnvironmentVariable('API_KEY', 'secret');
      store.setConversationVariable('sessionId', 'session-123');

      const snapshot = store.getSnapshot();

      expect(snapshot).toEqual({
        nodeOutputs: {
          node1: { port1: 'value1' },
        },
        environmentVariables: {
          API_KEY: 'secret',
        },
        conversationVariables: {
          sessionId: 'session-123',
        },
      });
    });
  });

  describe('getNodeContext', () => {
    it('노드 컨텍스트 정보 반환', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node1', 'port2', 'value2');

      const context = store.getNodeContext('node1');

      expect(context).toEqual({
        outputs: { port1: 'value1', port2: 'value2' },
        hasOutputs: true,
      });
    });

    it('출력이 없는 노드는 hasOutputs가 false', () => {
      const store = useVariablePoolStore.getState();

      const context = store.getNodeContext('node1');

      expect(context).toEqual({
        outputs: {},
        hasOutputs: false,
      });
    });
  });

  describe('통합 시나리오', () => {
    it('워크플로우 실행 시나리오', () => {
      const store = useVariablePoolStore.getState();

      // 1. Variable Pool 초기화
      store.clearAllOutputs();
      store.setEnvironmentVariables({ API_KEY: 'xxx' });
      store.setConversationVariables({ sessionId: 'session-123' });

      // 2. Start 노드 출력 설정
      store.setNodeOutput('start_1', 'user_message', '안녕하세요');
      store.setNodeOutput('start_1', 'session_id', 'session-123');

      // 3. Knowledge 노드 출력 설정
      const documents = [
        { id: '1', content: 'doc1' },
        { id: '2', content: 'doc2' },
      ];
      store.setNodeOutput('knowledge_1', 'documents', documents);
      store.setNodeOutput('knowledge_1', 'context', 'combined context');

      // 4. 변수 참조 해석
      const userMessage = store.resolveVariablePath('start_1.user_message');
      const context = store.resolveVariablePath('knowledge_1.context');

      expect(userMessage).toBe('안녕하세요');
      expect(context).toBe('combined context');

      // 5. LLM 노드 출력 설정
      store.setNodeOutput('llm_1', 'response', 'AI 응답입니다');
      store.setNodeOutput('llm_1', 'tokens_used', 150);

      // 6. 최종 상태 확인
      const snapshot = store.getSnapshot();

      expect(Object.keys(snapshot.nodeOutputs)).toHaveLength(3);
      expect(snapshot.nodeOutputs['start_1']).toBeDefined();
      expect(snapshot.nodeOutputs['knowledge_1']).toBeDefined();
      expect(snapshot.nodeOutputs['llm_1']).toBeDefined();
    });
  });
});
