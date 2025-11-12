/**
 * Prompt Studio API Service
 * 프롬프트 스튜디오 API 서비스
 *
 * 실제 API 호출은 프로젝트 표준 apiClient를 사용하도록 수정되었습니다.
 * Mock 데이터 반환 로직은 개발 편의를 위해 유지됩니다.
 */
import { apiClient } from '@/shared/api/client';
import { mockTestSets } from '../data/mockTestSets';
import type {
  TestSetListResponse,
  CreateTestSetRequest,
  CreateTestSetResponse,
  TestSetDetailResponse,
  UpdateWinnerRequest,
  UpdateWinnerResponse,
  RefinePersonaRequest,
  RefinePersonaResponse,
} from '../types/api';
import type { TestSet } from '../types/testSet';

// API 엔드포인트 (실제 프로젝트에서는 @/shared/constants/apiEndpoints.ts 와 같은 곳에서 관리될 수 있습니다)
const ENDPOINTS = {
  TEST_SETS: '/prompt-studio/test-sets',
  TEST_SET_DETAIL: (testSetId: string) => `/prompt-studio/test-sets/${testSetId}`,
  UPDATE_WINNER: (testSetId: string) =>
    `/prompt-studio/test-sets/${testSetId}/winner`,
  REFINE_PERSONA: '/prompt-studio/prompts/refine',
};

/**
 * 테스트 세트 목록 조회
 * GET /prompt-studio/test-sets
 */
export const getTestSets = async (): Promise<TestSetListResponse> => {
  // ============================================================
  // 실제 API 호출 (apiClient 사용)
  // ============================================================
  /*
  try {
    const response = await apiClient.get<TestSetListResponse>(ENDPOINTS.TEST_SETS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch test sets:', error);
    throw error;
  }
  */

  // ============================================================
  // Mock 데이터 반환 (개발용)
  // ============================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        testSets: mockTestSets,
      });
    }, 500);
  });
};

/**
 * 새로운 테스트 세트 생성 및 실행
 * POST /prompt-studio/test-sets
 */
export const createTestSet = async (
  request: CreateTestSetRequest,
): Promise<CreateTestSetResponse> => {
  // ============================================================
  // 실제 API 호출 (apiClient 사용)
  // ============================================================
  /*
  try {
    const response = await apiClient.post<CreateTestSetResponse>(
      ENDPOINTS.TEST_SETS,
      request,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to create test set:', error);
    throw error;
  }
  */

  // ============================================================
  // Mock 데이터 반환 (개발용)
  // ============================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTestSetId = `ts-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      resolve({
        testSetId: newTestSetId,
      });
    }, 800);
  });
};

/**
 * 특정 테스트 세트 상세 조회
 * GET /prompt-studio/test-sets/{testSetId}
 */
export const getTestSetDetail = async (
  testSetId: string,
): Promise<TestSetDetailResponse> => {
  // ============================================================
  // 실제 API 호출 (apiClient 사용)
  // ============================================================
  /*
  try {
    const response = await apiClient.get<TestSetDetailResponse>(
      ENDPOINTS.TEST_SET_DETAIL(testSetId),
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch test set detail:', error);
    throw error;
  }
  */

  // ============================================================
  // Mock 데이터 반환 (개발용)
  // ============================================================
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const testSet = mockTestSets.find(ts => ts.id === testSetId);
      if (testSet) {
        // The API expects a TestSetDetailResponse, so we need to adapt
        // our TestSet type. For now, we'll cast it, assuming the structure
        // is compatible enough for the mock scenario.
        resolve(testSet as unknown as TestSetDetailResponse);
      } else {
        reject(new Error('Test set not found'));
      }
    }, 600);
  });
};

/**
 * Winner 모델 선택
 * PATCH /prompt-studio/test-sets/{testSetId}/winner
 */
export const updateWinnerModel = async (
  testSetId: string,
  request: UpdateWinnerRequest,
): Promise<UpdateWinnerResponse> => {
  // ============================================================
  // 실제 API 호출 (apiClient 사용)
  // ============================================================
  /*
  try {
    const response = await apiClient.patch<UpdateWinnerResponse>(
      ENDPOINTS.UPDATE_WINNER(testSetId),
      request,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update winner model:', error);
    throw error;
  }
  */

  // ============================================================
  // Mock 데이터 반환 (개발용)
  // ============================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Winner model updated successfully.',
      });
    }, 400);
  });
};

/**
 * 페르소나 정제
 * POST /prompt-studio/prompts/refine
 */
export const refinePersona = async (
  request: RefinePersonaRequest,
): Promise<RefinePersonaResponse> => {
  // ============================================================
  // 실제 API 호출 (apiClient 사용)
  // ============================================================
  /*
  try {
    const response = await apiClient.post<RefinePersonaResponse>(
      ENDPOINTS.REFINE_PERSONA,
      request,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to refine persona:', error);
    throw error;
  }
  */

  // ============================================================
  // Mock 데이터 반환 (개발용)
  // ============================================================
  return new Promise((resolve) => {
    setTimeout(() => {
      const refinedPersona = `당신은 전문적이고 친절한 고객 지원 상담원입니다. 다음 지침을 따라주세요:

1. 항상 정중하고 따뜻한 말투를 사용하세요
2. 고객의 질문을 정확히 이해하고 명확하게 답변하세요
3. 필요한 경우 추가 정보를 요청하세요
4. 답변은 간결하면서도 완전해야 합니다

원본 페르소나: "${request.persona}"`;

      resolve({
        refinedPersona,
      });
    }, 1200);
  });
};

/**
 * Polling 유틸리티 함수
 * 테스트 세트가 완료될 때까지 주기적으로 상태를 확인합니다.
 */
export const pollTestSetStatus = async (
  testSetId: string,
  interval: number = 3000,
  maxAttempts: number = 100,
): Promise<TestSetDetailResponse> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const detail = await getTestSetDetail(testSetId);

    if (detail.status === 'completed' || detail.status === 'failed') {
      return detail;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('Polling timeout: Test set did not complete in time');
};
