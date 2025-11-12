/**
 * API Request/Response Type Definitions
 * API 요청/응답 타입 정의
 */

/**
 * 테스트 세트 목록 조회 응답
 * GET /api/v1/prompt-studio/test-sets
 */
export interface TestSetListResponse {
  testSets: TestSetSummary[];
}

export interface TestSetSummary {
  testSetId: string;
  testSetName: string;
  createdAt: string;
  modelCount: number;
}

/**
 * 테스트 세트 생성 요청
 * POST /api/v1/prompt-studio/test-sets
 */
export interface CreateTestSetRequest {
  testSetName: string;
  persona: string;
  testInputs: string[];
  context?: string;
  models: string[];
  advancedSettings: AdvancedSettingsAPI;
}

/**
 * 고급 설정 (API 형식)
 */
export interface AdvancedSettingsAPI {
  temperature: number;
  maxTokens?: number | null;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  seed?: number | null;
}

/**
 * 테스트 세트 생성 응답
 * 202 Accepted
 */
export interface CreateTestSetResponse {
  testSetId: string;
}

/**
 * 테스트 세트 상세 조회 응답
 * GET /api/v1/prompt-studio/test-sets/{testSetId}
 */
export interface TestSetDetailResponse {
  testSetId: string;
  testSetName: string;
  createdAt: string;
  status: TestSetStatus;
  persona: string;
  testInputs: string[];
  modelsTested: string[];
  advancedSettings: AdvancedSettingsAPI;
  modelResults: ModelResult[];
  winnerModel: string | null;
}

/**
 * 테스트 세트 상태
 */
export type TestSetStatus = 'processing' | 'completed' | 'failed';

/**
 * 모델별 테스트 결과
 */
export interface ModelResult {
  modelName: string;
  answer: string;
  responseTime: number; // seconds
  cost: number; // USD
  quality: QualityMetrics;
}

/**
 * 품질 평가 지표
 */
export interface QualityMetrics {
  totalScore: number;
  accuracy: number;
  relevance: number;
  completeness: number;
  consistency: number;
  toneAndStyle: number;
  reasoning?: string; // 평가 근거
}

/**
 * Winner 모델 선택 요청
 * PATCH /api/v1/prompt-studio/test-sets/{testSetId}/winner
 */
export interface UpdateWinnerRequest {
  winnerModel: string;
}

/**
 * Winner 모델 선택 응답
 */
export interface UpdateWinnerResponse {
  message: string;
}

/**
 * 페르소나 정제 요청
 * POST /api/v1/prompt-studio/prompts/refine
 */
export interface RefinePersonaRequest {
  persona: string;
}

/**
 * 페르소나 정제 응답
 */
export interface RefinePersonaResponse {
  refinedPersona: string;
}

/**
 * API 에러 응답
 */
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
