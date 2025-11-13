// src/features/workflow/hooks/useRecentVariables.ts

import { useState, useCallback, useEffect } from 'react';
import { VariableReference } from '@shared/types/workflow';

const RECENT_VARIABLES_KEY = 'workflow_recent_variables';
const MAX_RECENT = 10;

/**
 * 최근 사용 변수 관리 훅
 */
export function useRecentVariables() {
  const [recentVariables, setRecentVariables] = useState<VariableReference[]>(
    []
  );

  // LocalStorage에서 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_VARIABLES_KEY);
      if (stored) {
        setRecentVariables(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent variables:', error);
    }
  }, []);

  // LocalStorage에 저장
  const saveToStorage = useCallback((variables: VariableReference[]) => {
    try {
      localStorage.setItem(RECENT_VARIABLES_KEY, JSON.stringify(variables));
    } catch (error) {
      console.error('Failed to save recent variables:', error);
    }
  }, []);

  // 최근 변수 추가
  const addRecentVariable = useCallback(
    (variable: VariableReference) => {
      setRecentVariables((prev) => {
        // 중복 제거
        const filtered = prev.filter((v) => v.fullPath !== variable.fullPath);

        // 맨 앞에 추가
        const updated = [variable, ...filtered].slice(0, MAX_RECENT);

        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // 최근 변수 초기화
  const clearRecentVariables = useCallback(() => {
    setRecentVariables([]);
    localStorage.removeItem(RECENT_VARIABLES_KEY);
  }, []);

  return {
    recentVariables,
    addRecentVariable,
    clearRecentVariables,
  };
}
