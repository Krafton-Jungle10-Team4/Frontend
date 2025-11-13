// src/features/workflow/hooks/__tests__/useAvailableVariables.test.ts

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAvailableVariables } from '../useAvailableVariables';
import { useWorkflowStore } from '../../stores/workflowStore';
import { PortType } from '@shared/types/workflow';

// Mock zustand store
vi.mock('../../stores/workflowStore', () => ({
  useWorkflowStore: vi.fn(),
}));

describe('useAvailableVariables', () => {
  beforeEach(() => {
    // 기본 워크플로우 설정: start → knowledge → llm
    const mockNodes = [
      {
        id: 'start_1',
        type: 'start',
        data: {
          title: 'Start',
          type: 'start',
          ports: {
            inputs: [],
            outputs: [
              {
                name: 'user_message',
                type: PortType.STRING,
                required: true,
                description: '',
                display_name: 'User Message',
              },
            ],
          },
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'knowledge_1',
        type: 'knowledge',
        data: {
          title: 'Knowledge',
          type: 'knowledge-retrieval',
          ports: {
            inputs: [
              {
                name: 'query',
                type: PortType.STRING,
                required: true,
                description: '',
                display_name: 'Query',
              },
            ],
            outputs: [
              {
                name: 'context',
                type: PortType.STRING,
                required: true,
                description: '',
                display_name: 'Context',
              },
            ],
          },
        },
        position: { x: 300, y: 0 },
      },
      {
        id: 'llm_1',
        type: 'llm',
        data: {
          title: 'LLM',
          type: 'llm',
          ports: {
            inputs: [
              {
                name: 'user_message',
                type: PortType.STRING,
                required: true,
                description: '',
                display_name: 'User Message',
              },
              {
                name: 'context',
                type: PortType.STRING,
                required: false,
                description: '',
                display_name: 'Context',
              },
            ],
            outputs: [
              {
                name: 'response',
                type: PortType.STRING,
                required: true,
                description: '',
                display_name: 'Response',
              },
            ],
          },
        },
        position: { x: 600, y: 0 },
      },
    ];

    const mockEdges = [
      {
        id: 'e1',
        source: 'start_1',
        target: 'knowledge_1',
        sourceHandle: 'user_message',
        targetHandle: 'query',
      },
      {
        id: 'e2',
        source: 'knowledge_1',
        target: 'llm_1',
        sourceHandle: 'context',
        targetHandle: 'context',
      },
    ];

    // Mock store implementation
    (useWorkflowStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          nodes: mockNodes,
          edges: mockEdges,
        };
        return selector(state);
      }
    );
  });

  it('upstream 노드의 출력 변수만 반환', () => {
    const { result } = renderHook(() => useAvailableVariables('llm_1'));

    expect(result.current).toHaveLength(2);
    expect(result.current.map((v) => v.fullPath)).toEqual([
      'start_1.user_message',
      'knowledge_1.context',
    ]);
  });

  it('타입 필터링 작동', () => {
    const { result } = renderHook(() =>
      useAvailableVariables('llm_1', PortType.STRING)
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((v) => v.type === PortType.STRING)).toBe(true);
  });

  it('현재 노드는 제외', () => {
    const { result } = renderHook(() => useAvailableVariables('llm_1'));

    expect(result.current.some((v) => v.nodeId === 'llm_1')).toBe(false);
  });

  it('변수 정보가 올바르게 포맷됨', () => {
    const { result } = renderHook(() => useAvailableVariables('llm_1'));

    const firstVar = result.current[0];
    expect(firstVar).toMatchObject({
      nodeId: 'start_1',
      nodeTitle: 'Start',
      portName: 'user_message',
      portDisplayName: 'User Message',
      type: PortType.STRING,
      fullPath: 'start_1.user_message',
    });
  });

  it('포트가 없는 노드는 건너뜀', () => {
    // 포트가 없는 노드 추가
    const noPortNode = {
      id: 'no_port_1',
      type: 'custom',
      data: {
        title: 'No Port Node',
        type: 'custom',
      },
      position: { x: 0, y: 0 },
    };

    (useWorkflowStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          nodes: [noPortNode],
          edges: [{ id: 'e1', source: 'no_port_1', target: 'llm_1' }],
        };
        return selector(state);
      }
    );

    const { result } = renderHook(() => useAvailableVariables('llm_1'));

    expect(result.current).toHaveLength(0);
  });

  it('타입이 ANY인 경우 모든 변수 허용', () => {
    const { result } = renderHook(() =>
      useAvailableVariables('llm_1', PortType.ANY)
    );

    expect(result.current).toHaveLength(2);
  });

  it('소스 타입이 ANY인 경우 모든 대상 타입 허용', () => {
    // ANY 타입 출력을 가진 노드 추가
    (useWorkflowStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          nodes: [
            {
              id: 'any_1',
              type: 'any',
              data: {
                title: 'Any Node',
                type: 'any',
                ports: {
                  outputs: [
                    {
                      name: 'output',
                      type: PortType.ANY,
                      required: true,
                      description: '',
                      display_name: 'Output',
                    },
                  ],
                },
              },
              position: { x: 0, y: 0 },
            },
          ],
          edges: [{ id: 'e1', source: 'any_1', target: 'llm_1' }],
        };
        return selector(state);
      }
    );

    const { result } = renderHook(() =>
      useAvailableVariables('llm_1', PortType.STRING)
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe(PortType.ANY);
  });
});
