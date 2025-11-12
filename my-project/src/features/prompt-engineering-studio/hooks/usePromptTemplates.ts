/**
 * Custom hook for prompt studio data
 * 프롬프트 스튜디오 데이터 관리 훅
 */

import { mockTemplates, mockModels, mockTestSets } from '../data/mockPrompts';

export function usePromptTemplates() {
  // 실제 프로젝트에서는 API 호출 및 상태 관리 로직 추가
  // 현재는 mock 데이터 반환
  return {
    templates: mockTemplates,
    models: mockModels,
    testSets: mockTestSets,
  };
}
