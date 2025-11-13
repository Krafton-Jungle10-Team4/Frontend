// src/features/workflow/utils/__tests__/variablePoolHelper.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAllNodeOutputs,
  initializeVariablePool,
  exportVariablePoolState,
  getVariablePoolStats,
  hasAllRequiredOutputs,
  isValidNodeOutput,
  resetVariablePool,
  copyNodeOutputs,
} from '../variablePoolHelper';
import { useVariablePoolStore } from '../../stores/variablePoolStore';

describe('variablePoolHelper', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    resetVariablePool();
  });

  describe('setAllNodeOutputs', () => {
    it('노드의 모든 출력을 일괄 설정', () => {
      setAllNodeOutputs('knowledge_1', {
        documents: ['doc1', 'doc2'],
        context: 'combined context',
        relevance_scores: [0.9, 0.8],
      });

      const store = useVariablePoolStore.getState();

      expect(store.getNodeOutput('knowledge_1', 'documents')).toEqual([
        'doc1',
        'doc2',
      ]);
      expect(store.getNodeOutput('knowledge_1', 'context')).toBe(
        'combined context'
      );
      expect(store.getNodeOutput('knowledge_1', 'relevance_scores')).toEqual([
        0.9, 0.8,
      ]);
    });

    it('빈 객체도 처리', () => {
      setAllNodeOutputs('node1', {});

      const store = useVariablePoolStore.getState();
      const outputs = store.getAllNodeOutputs('node1');

      expect(outputs).toEqual({});
    });
  });

  describe('initializeVariablePool', () => {
    it('Variable Pool 초기화', () => {
      const store = useVariablePoolStore.getState();

      // 기존 데이터 설정
      store.setNodeOutput('node1', 'port1', 'value1');
      store.setEnvironmentVariable('OLD_VAR', 'old');

      // 초기화
      initializeVariablePool(
        { API_KEY: 'xxx', MAX_TOKENS: 1000 },
        { sessionId: 'session-123', userId: 'user-456' }
      );

      // 노드 출력 초기화 확인
      expect(store.nodeOutputs).toEqual({});

      // 환경 변수 설정 확인
      expect(store.getEnvironmentVariable('API_KEY')).toBe('xxx');
      expect(store.getEnvironmentVariable('MAX_TOKENS')).toBe(1000);
      expect(store.getEnvironmentVariable('OLD_VAR')).toBeUndefined();

      // 대화 변수 설정 확인
      expect(store.getConversationVariable('sessionId')).toBe('session-123');
      expect(store.getConversationVariable('userId')).toBe('user-456');
    });

    it('환경 변수 없이 초기화', () => {
      const store = useVariablePoolStore.getState();
      store.setNodeOutput('node1', 'port1', 'value1');

      initializeVariablePool();

      expect(store.nodeOutputs).toEqual({});
    });

    it('대화 변수만 설정하여 초기화', () => {
      initializeVariablePool(undefined, { sessionId: 'session-123' });

      const store = useVariablePoolStore.getState();

      expect(store.getConversationVariable('sessionId')).toBe('session-123');
    });
  });

  describe('exportVariablePoolState', () => {
    it('상태를 JSON으로 export', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setEnvironmentVariable('API_KEY', 'secret');
      store.setConversationVariable('sessionId', 'session-123');

      const json = exportVariablePoolState();
      const parsed = JSON.parse(json);

      expect(parsed).toEqual({
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

    it('빈 상태도 export', () => {
      const json = exportVariablePoolState();
      const parsed = JSON.parse(json);

      expect(parsed).toEqual({
        nodeOutputs: {},
        environmentVariables: {},
        conversationVariables: {},
      });
    });
  });

  describe('getVariablePoolStats', () => {
    it('통계 정보 반환', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setNodeOutput('node1', 'port2', 'value2');
      store.setNodeOutput('node2', 'port1', 'value1');
      store.setEnvironmentVariable('API_KEY', 'secret');
      store.setEnvironmentVariable('MAX_TOKENS', 1000);
      store.setConversationVariable('sessionId', 'session-123');

      const stats = getVariablePoolStats();

      expect(stats).toEqual({
        totalNodes: 2,
        totalOutputs: 3,
        environmentVariablesCount: 2,
        conversationVariablesCount: 1,
      });
    });

    it('빈 상태 통계', () => {
      const stats = getVariablePoolStats();

      expect(stats).toEqual({
        totalNodes: 0,
        totalOutputs: 0,
        environmentVariablesCount: 0,
        conversationVariablesCount: 0,
      });
    });
  });

  describe('hasAllRequiredOutputs', () => {
    it('모든 필수 출력이 존재하는 경우', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('llm_1', 'response', 'AI 응답');
      store.setNodeOutput('llm_1', 'tokens_used', 150);

      const result = hasAllRequiredOutputs('llm_1', ['response', 'tokens_used']);

      expect(result).toBe(true);
    });

    it('일부 필수 출력이 없는 경우', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('llm_1', 'response', 'AI 응답');

      const result = hasAllRequiredOutputs('llm_1', ['response', 'tokens_used']);

      expect(result).toBe(false);
    });

    it('빈 필수 출력 배열', () => {
      const result = hasAllRequiredOutputs('node1', []);

      expect(result).toBe(true);
    });

    it('노드가 존재하지 않는 경우', () => {
      const result = hasAllRequiredOutputs('nonexistent', ['port1']);

      expect(result).toBe(false);
    });
  });

  describe('isValidNodeOutput', () => {
    it('유효한 출력 확인', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value');

      expect(isValidNodeOutput('node1', 'port1')).toBe(true);
    });

    it('존재하지 않는 출력은 유효하지 않음', () => {
      expect(isValidNodeOutput('node1', 'port1')).toBe(false);
    });

    it('null 값은 유효하지 않음', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', null);

      expect(isValidNodeOutput('node1', 'port1')).toBe(false);
    });

    it('undefined 값은 유효하지 않음', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', undefined);

      expect(isValidNodeOutput('node1', 'port1')).toBe(false);
    });

    it('0은 유효한 값', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 0);

      expect(isValidNodeOutput('node1', 'port1')).toBe(true);
    });

    it('빈 문자열은 유효한 값', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', '');

      expect(isValidNodeOutput('node1', 'port1')).toBe(true);
    });

    it('false는 유효한 값', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', false);

      expect(isValidNodeOutput('node1', 'port1')).toBe(true);
    });
  });

  describe('resetVariablePool', () => {
    it('모든 상태 초기화', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('node1', 'port1', 'value1');
      store.setEnvironmentVariable('API_KEY', 'secret');
      store.setConversationVariable('sessionId', 'session-123');

      resetVariablePool();

      expect(store.nodeOutputs).toEqual({});
      expect(store.environmentVariables).toEqual({});
      expect(store.conversationVariables).toEqual({});
    });
  });

  describe('copyNodeOutputs', () => {
    it('노드 출력 복사', () => {
      const store = useVariablePoolStore.getState();

      store.setNodeOutput('llm_1', 'response', 'AI 응답');
      store.setNodeOutput('llm_1', 'tokens_used', 150);

      copyNodeOutputs('llm_1', 'llm_1_backup');

      expect(store.getNodeOutput('llm_1_backup', 'response')).toBe('AI 응답');
      expect(store.getNodeOutput('llm_1_backup', 'tokens_used')).toBe(150);

      // 원본은 그대로 유지
      expect(store.getNodeOutput('llm_1', 'response')).toBe('AI 응답');
      expect(store.getNodeOutput('llm_1', 'tokens_used')).toBe(150);
    });

    it('빈 출력 복사', () => {
      copyNodeOutputs('node1', 'node2');

      const store = useVariablePoolStore.getState();
      const outputs = store.getAllNodeOutputs('node2');

      expect(outputs).toEqual({});
    });
  });

  describe('통합 시나리오', () => {
    it('전체 Helper 함수 흐름', () => {
      // 1. Variable Pool 초기화
      initializeVariablePool(
        { API_KEY: 'xxx' },
        { sessionId: 'session-123' }
      );

      // 2. 노드 출력 일괄 설정
      setAllNodeOutputs('start_1', {
        user_message: '안녕하세요',
        session_id: 'session-123',
      });

      setAllNodeOutputs('knowledge_1', {
        documents: ['doc1', 'doc2'],
        context: 'combined context',
      });

      // 3. 통계 확인
      let stats = getVariablePoolStats();
      expect(stats.totalNodes).toBe(2);
      expect(stats.totalOutputs).toBe(4);

      // 4. 필수 출력 확인
      expect(
        hasAllRequiredOutputs('start_1', ['user_message', 'session_id'])
      ).toBe(true);
      expect(
        hasAllRequiredOutputs('knowledge_1', ['documents', 'context'])
      ).toBe(true);

      // 5. 출력 유효성 검증
      expect(isValidNodeOutput('start_1', 'user_message')).toBe(true);
      expect(isValidNodeOutput('knowledge_1', 'documents')).toBe(true);

      // 6. 노드 출력 복사
      copyNodeOutputs('start_1', 'start_1_backup');

      stats = getVariablePoolStats();
      expect(stats.totalNodes).toBe(3);

      // 7. 상태 export
      const json = exportVariablePoolState();
      const state = JSON.parse(json);

      expect(Object.keys(state.nodeOutputs)).toHaveLength(3);

      // 8. 초기화
      resetVariablePool();

      stats = getVariablePoolStats();
      expect(stats.totalNodes).toBe(0);
      expect(stats.totalOutputs).toBe(0);
    });
  });
});
