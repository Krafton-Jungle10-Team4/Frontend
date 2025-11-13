// src/features/workflow/hooks/__tests__/useRecentVariables.test.ts

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRecentVariables } from '../useRecentVariables';
import { PortType } from '@shared/types/workflow';
import type { VariableReference } from '@shared/types/workflow';

// LocalStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useRecentVariables', () => {
  const mockVariable1: VariableReference = {
    nodeId: 'node_1',
    nodeTitle: 'Node 1',
    portName: 'output_1',
    portDisplayName: 'Output 1',
    type: PortType.STRING,
    fullPath: 'node_1.output_1',
  };

  const mockVariable2: VariableReference = {
    nodeId: 'node_2',
    nodeTitle: 'Node 2',
    portName: 'output_2',
    portDisplayName: 'Output 2',
    type: PortType.NUMBER,
    fullPath: 'node_2.output_2',
  };

  const mockVariable3: VariableReference = {
    nodeId: 'node_3',
    nodeTitle: 'Node 3',
    portName: 'output_3',
    portDisplayName: 'Output 3',
    type: PortType.STRING,
    fullPath: 'node_3.output_3',
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('초기 상태는 빈 배열', () => {
    const { result } = renderHook(() => useRecentVariables());

    expect(result.current.recentVariables).toEqual([]);
  });

  it('localStorage에서 저장된 변수 로드', () => {
    const savedVariables = [mockVariable1, mockVariable2];
    localStorageMock.setItem(
      'workflow_recent_variables',
      JSON.stringify(savedVariables)
    );

    const { result } = renderHook(() => useRecentVariables());

    expect(result.current.recentVariables).toEqual(savedVariables);
  });

  it('변수 추가 시 맨 앞에 삽입', () => {
    const { result } = renderHook(() => useRecentVariables());

    act(() => {
      result.current.addRecentVariable(mockVariable1);
    });

    expect(result.current.recentVariables).toEqual([mockVariable1]);

    act(() => {
      result.current.addRecentVariable(mockVariable2);
    });

    expect(result.current.recentVariables).toEqual([
      mockVariable2,
      mockVariable1,
    ]);
  });

  it('중복 변수 추가 시 맨 앞으로 이동', () => {
    const { result } = renderHook(() => useRecentVariables());

    act(() => {
      result.current.addRecentVariable(mockVariable1);
      result.current.addRecentVariable(mockVariable2);
      result.current.addRecentVariable(mockVariable3);
    });

    expect(result.current.recentVariables).toEqual([
      mockVariable3,
      mockVariable2,
      mockVariable1,
    ]);

    // mockVariable1 재추가
    act(() => {
      result.current.addRecentVariable(mockVariable1);
    });

    expect(result.current.recentVariables).toEqual([
      mockVariable1,
      mockVariable3,
      mockVariable2,
    ]);
  });

  it('최대 10개까지만 저장', () => {
    const { result } = renderHook(() => useRecentVariables());

    // 11개 변수 추가
    act(() => {
      for (let i = 0; i < 11; i++) {
        result.current.addRecentVariable({
          nodeId: `node_${i}`,
          nodeTitle: `Node ${i}`,
          portName: `output_${i}`,
          portDisplayName: `Output ${i}`,
          type: PortType.STRING,
          fullPath: `node_${i}.output_${i}`,
        });
      }
    });

    expect(result.current.recentVariables).toHaveLength(10);
    expect(result.current.recentVariables[0].nodeId).toBe('node_10');
    expect(result.current.recentVariables[9].nodeId).toBe('node_1');
  });

  it('localStorage에 자동 저장', () => {
    const { result } = renderHook(() => useRecentVariables());

    act(() => {
      result.current.addRecentVariable(mockVariable1);
    });

    const stored = localStorageMock.getItem('workflow_recent_variables');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual([mockVariable1]);
  });

  it('clearRecentVariables로 초기화', () => {
    const { result } = renderHook(() => useRecentVariables());

    act(() => {
      result.current.addRecentVariable(mockVariable1);
      result.current.addRecentVariable(mockVariable2);
    });

    expect(result.current.recentVariables).toHaveLength(2);

    act(() => {
      result.current.clearRecentVariables();
    });

    expect(result.current.recentVariables).toEqual([]);
    expect(localStorageMock.getItem('workflow_recent_variables')).toBeNull();
  });

  it('잘못된 localStorage 데이터는 무시', () => {
    localStorageMock.setItem('workflow_recent_variables', 'invalid json');

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useRecentVariables());

    expect(result.current.recentVariables).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('localStorage 저장 실패 시 에러 로그', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // localStorage.setItem 에러 발생 시뮬레이션
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useRecentVariables());

    act(() => {
      result.current.addRecentVariable(mockVariable1);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to save recent variables:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });
});
