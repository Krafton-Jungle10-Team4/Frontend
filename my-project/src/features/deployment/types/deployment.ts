/**
 * Deployment Feature Types
 * 배포 관리 관련 모든 타입 정의
 */

// ============= Widget Config Types =============

/**
 * 위젯 UI 설정을 정의하는 객체
 * 모든 필드는 선택 사항이며, 백엔드에서 기본값을 제공합니다.
 */
export interface WidgetConfig {
  // 테마 설정
  theme?: 'light' | 'dark' | 'auto'; // 기본값: "light"
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'; // 기본값: "bottom-right"

  // 자동 열기 설정
  auto_open?: boolean; // 기본값: false
  auto_open_delay?: number; // 밀리초, 기본값: 5000

  // 메시지 설정
  welcome_message?: string; // 기본값: "안녕하세요! 무엇을 도와드릴까요?"
  placeholder_text?: string; // 기본값: "메시지를 입력하세요..."

  // 스타일 설정
  primary_color?: string; // Hex 색상 코드, 기본값: "#0066FF"
  bot_name?: string; // 기본값: "AI Assistant"
  avatar_url?: string | null; // 아바타 이미지 URL, 선택 사항

  // UI 기능
  show_typing_indicator?: boolean; // 기본값: true
  enable_file_upload?: boolean; // 기본값: false
  max_file_size_mb?: number; // 기본값: 10
  allowed_file_types?: string[]; // 기본값: ["pdf", "jpg", "png", "doc", "docx"]

  // 사용자 피드백
  enable_feedback?: boolean; // 기본값: true
  enable_sound?: boolean; // 기본값: true

  // 대화 저장
  save_conversation?: boolean; // 기본값: true
  conversation_storage?: 'localStorage' | 'sessionStorage'; // 기본값: "localStorage"

  // 커스터마이징
  custom_css?: string; // CSS 코드, 기본값: ""
  custom_js?: string; // JavaScript 코드, 기본값: ""
}

// ============= Deployment Status Types =============

/**
 * 배포 상태를 나타내는 타입
 * - draft: 초안 상태 (위젯 비활성)
 * - published: 배포됨 (위젯 활성)
 * - suspended: 일시 중단 (위젯 비활성)
 */
export type DeploymentStatus = 'draft' | 'published' | 'suspended';

// ============= Deployment Entity Types =============

/**
 * 배포 엔티티
 * API 응답 형식과 일치하는 전체 배포 정보
 */
export interface Deployment {
  deployment_id: string; // UUID
  bot_id: string;
  bot_name?: string; // 봇 이름
  widget_key: string; // 64자 위젯 인증 키
  status: DeploymentStatus;
  embed_script: string; // 웹사이트에 삽입할 HTML 스크립트
  widget_url: string; // 위젯 서비스 URL
  allowed_domains: string[] | null; // 허용된 도메인 목록 (null이면 모든 도메인 허용)
  widget_config: WidgetConfig;
  version: number; // 배포 버전 (업데이트시 증가)
  analytics: Record<string, unknown> | null; // 분석 데이터 (향후 구현)
  created_at: string; // ISO 8601 형식
  updated_at: string | null;
  last_active_at: string | null;
}

// ============= Deployment DTO Types =============

/**
 * 배포 생성 또는 업데이트 요청 DTO
 * POST /api/v1/bots/{bot_id}/deploy
 */
export interface DeploymentCreateRequest {
  status?: DeploymentStatus; // 선택, 기본값: "published"
  allowed_domains?: string[] | null; // 호스트명만 입력 (예: "example.com", "*.example.com")
  widget_config: WidgetConfig; // 필수
  workflow_version_id: string; // 필수: 배포할 워크플로우 버전 UUID
}

/**
 * 배포 상태 변경 요청 DTO
 * PATCH /api/v1/bots/{bot_id}/deployment/status
 */
export interface DeploymentStatusUpdateRequest {
  status: DeploymentStatus; // 필수
  reason?: string; // 상태 변경 사유 (로깅 목적)
}

/**
 * 배포 상태 변경 응답 DTO
 */
export interface DeploymentStatusUpdateResponse {
  message: string;
  status: DeploymentStatus;
}

/**
 * 배포 삭제 응답 DTO
 */
export interface DeploymentDeleteResponse {
  message: string;
}

// ============= Deployment Store Types =============

/**
 * Deployment Store 상태
 */
export interface DeploymentState {
  // 배포 정보
  deployment: Deployment | null;
  isLoading: boolean;
  error: string | null;

  // 다이얼로그 상태
  isEmbedDialogOpen: boolean;
  isApiDialogOpen: boolean;

  // 로컬 편집용 위젯 설정
  widgetConfig: WidgetConfig;
}

// ============= Type Guards =============

/**
 * Deployment 타입 가드
 */
export const isDeployment = (value: unknown): value is Deployment => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const deployment = value as Deployment;

  return (
    typeof deployment.deployment_id === 'string' &&
    typeof deployment.bot_id === 'string' &&
    typeof deployment.widget_key === 'string' &&
    ['draft', 'published', 'suspended'].includes(deployment.status) &&
    typeof deployment.embed_script === 'string' &&
    typeof deployment.widget_url === 'string' &&
    (Array.isArray(deployment.allowed_domains) ||
      deployment.allowed_domains === null) &&
    typeof deployment.widget_config === 'object' &&
    typeof deployment.version === 'number' &&
    typeof deployment.created_at === 'string'
  );
};

/**
 * DeploymentStatus 타입 가드
 */
export const isDeploymentStatus = (value: unknown): value is DeploymentStatus => {
  return (
    typeof value === 'string' &&
    ['draft', 'published', 'suspended'].includes(value)
  );
};

// ============= Utility Types =============

/**
 * 배포 상태 레이블 매핑
 */
export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  draft: '초안',
  published: '배포됨',
  suspended: '일시 중단',
} as const;

/**
 * 배포 상태 색상 매핑 (Tailwind/shadcn 스타일)
 */
export const DEPLOYMENT_STATUS_COLORS: Record<
  DeploymentStatus,
  'default' | 'success' | 'warning'
> = {
  draft: 'default',
  published: 'success',
  suspended: 'warning',
} as const;
