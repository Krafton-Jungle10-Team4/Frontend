/**
 * API 엔드포인트 상수
 */

// SnapAgent API Base URL - 환경변수에서 가져오기
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.snapagent.shop';
export const API_TIMEOUT = 30000; // 30초

export const API_ENDPOINTS = {
  // 인증 (SnapAgent API)
  AUTH: {
    GOOGLE_LOGIN: '/api/v1/auth/google/login',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback',
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    LOGOUT: '/api/v1/auth/logout',
  },

  // 팀 관리 (SnapAgent API)
  TEAMS: {
    ME: '/api/v1/teams/me',
    API_KEYS: (teamId: number) => `/api/v1/teams/${teamId}/api-keys`,
    API_KEY_DELETE: (teamId: number, keyId: number) =>
      `/api/v1/teams/${teamId}/api-keys/${keyId}`,
    INVITES: (teamId: number) => `/api/v1/teams/${teamId}/invites`,
    JOIN: (token: string) => `/api/v1/teams/join/${token}`,
  },

  // 문서 관리 (SnapAgent API)
  DOCUMENTS: {
    // 비동기 업로드 엔드포인트
    UPLOAD: '/api/v1/documents/upload-async',
    SEARCH: '/api/v1/documents/search',
    BY_ID: (documentId: string) => `/api/v1/documents/${documentId}`,

    // 비동기 처리 엔드포인트
    STATUS: (documentId: string) => `/api/v1/documents/status/${documentId}`,
    LIST: '/api/v1/documents/list',
    RETRY: (documentId: string) => `/api/v1/documents/retry/${documentId}`,
  },

  // 채팅 (SnapAgent API)
  CHAT: {
    SEND: '/api/v1/chat',
    STREAM: '/api/v1/chat/stream',
    HEALTH: '/api/v1/chat/health',
  },

  // 헬스 체크 (SnapAgent API)
  HEALTH: {
    ROOT: '/health',
    API: '/api/v1/health',
  },

  // 봇 관리 (SnapAgent API)
  BOTS: {
    LIST: '/api/v1/bots',
    CREATE: '/api/v1/bots',
    BY_ID: (id: string) => `/api/v1/bots/${id}`,
    UPDATE: (id: string) => `/api/v1/bots/${id}`,
    DELETE: (id: string) => `/api/v1/bots/${id}`,
    STATUS: (id: string) => `/api/v1/bots/${id}/status`,
    ENABLE_WORKFLOW_V2: (id: string) => `/api/v1/bots/${id}/workflow-v2/enable`,
    // 배포 관리
    DEPLOY: (botId: string) => `/api/v1/bots/${botId}/deploy`,
    DEPLOYMENT: (botId: string) => `/api/v1/bots/${botId}/deployment`,
    DEPLOYMENT_STATUS: (botId: string) =>
      `/api/v1/bots/${botId}/deployment/status`,
    TAGS: '/api/v1/bots/tags',
  },

  // 워크플로우 관리 (SnapAgent API)
  WORKFLOWS: {
    // 노드 타입 관련
    NODE_TYPES: '/api/v1/workflows/node-types',
    NODE_TYPE_DETAIL: (type: string) => `/api/v1/workflows/node-types/${type}`,

    // 모델 관련
    MODELS: '/api/v1/workflows/models',

    // 검증
    VALIDATE: '/api/v1/workflows/validate',
    BOT_WORKFLOW_VALIDATE: (botId: string) =>
      `/api/v1/workflows/bots/${botId}/workflow/validate`,

    // 워크플로우 버전/Draft 관리
    BOT_WORKFLOW_VERSIONS: (botId: string) =>
      `/api/v1/bots/${botId}/workflow-versions`,
    BOT_WORKFLOW_VERSION_DETAIL: (botId: string, versionId: string) =>
      `/api/v1/bots/${botId}/workflow-versions/${versionId}`,
    BOT_WORKFLOW_VERSION_DRAFT: (botId: string) =>
      `/api/v1/bots/${botId}/workflow-versions/draft`,
    BOT_WORKFLOW_VERSION_PUBLISH: (botId: string, versionId: string) =>
      `/api/v1/bots/${botId}/workflow-versions/${versionId}/publish`,

    // 실행 이력
    WORKFLOW_RUNS: (botId: string) =>
      `/api/v1/bots/${botId}/workflow-executions`,
    WORKFLOW_RUN_DETAIL: (botId: string, runId: string) =>
      `/api/v1/bots/${botId}/workflow-executions/${runId}`,
    WORKFLOW_RUN_NODES: (botId: string, runId: string) =>
      `/api/v1/bots/${botId}/workflow-executions/${runId}/nodes`,
    WORKFLOW_RUN_NODE_DETAIL: (
      botId: string,
      runId: string,
      nodeId: string
    ) => `/api/v1/bots/${botId}/workflow-executions/${runId}/nodes/${nodeId}`,

    // Variable Assigner 노드 관련
    DEFAULT_NODE_CONFIG: (botId: string, nodeType: string) =>
      `/api/v1/bots/${botId}/workflows/default-workflow-block-configs/${nodeType}`,
    NODE_PORTS: (nodeId: string) => `/api/v1/workflows/nodes/${nodeId}/ports`,
  },

  // 레거시 (호환성 유지)
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Widget 임베딩 (SnapAgent API)
  WIDGET: {
    CONFIG: (widgetKey: string) => `/api/v1/widget/config/${widgetKey}`,
    SESSIONS: '/api/v1/widget/sessions',
    CHAT: '/api/v1/widget/chat',
    CHAT_STREAM: '/api/v1/widget/chat/stream',
    TRACK: (widgetKey: string) => `/api/v1/widget/config/${widgetKey}/track`,
  },

  // MCP 관리 (SnapAgent API)
  MCP: {
    PROVIDERS: '/api/v1/mcp/providers',
    PROVIDER_DETAIL: (providerId: string) =>
      `/api/v1/mcp/providers/${providerId}`,
    KEYS: '/api/v1/mcp/keys',
    KEY_DETAIL: (keyId: string) => `/api/v1/mcp/keys/${keyId}`,
  },

  // Tavily Search API
  TAVILY: {
    SEARCH: '/api/v1/tavily/search',
    VALIDATE_KEY: '/api/v1/tavily/validate-key',
  },

  // 비용 모니터링 (SnapAgent API)
  COST: {
    USAGE: (botId: string) => `/api/v1/cost/usage/${botId}`,
    USAGE_BREAKDOWN: (botId: string) =>
      `/api/v1/cost/usage/${botId}/breakdown`,
    DAILY_USAGE: (botId: string) => `/api/v1/cost/usage/${botId}/daily`,
    PRICING: '/api/v1/cost/pricing',
  },

  // 지식 관리 (SnapAgent API)
  KNOWLEDGE: {
    LIST: '/api/v1/knowledge',
    DETAIL: (knowledgeId: string) => `/api/v1/knowledge/${knowledgeId}`,
    CREATE: '/api/v1/knowledge',
    UPDATE: (knowledgeId: string) => `/api/v1/knowledge/${knowledgeId}`,
    DELETE: (knowledgeId: string) => `/api/v1/knowledge/${knowledgeId}`,
    TAGS: '/api/v1/knowledge/tags',
  },

  // 템플릿 관리 (SnapAgent API)
  TEMPLATES: {
    LIST: '/api/v1/templates',
    DETAIL: (id: string) => `/api/v1/templates/${id}`,
    EXPORT: '/api/v1/templates/export',
    VALIDATE_EXPORT: '/api/v1/templates/validate-export',
    VALIDATE_IMPORT: (id: string) => `/api/v1/templates/${id}/validate-import`,
    UPLOAD: '/api/v1/templates/upload',
    DELETE: (id: string) => `/api/v1/templates/${id}`,
    UPDATE: (id: string) => `/api/v1/templates/${id}`,
    USAGE: (id: string) => `/api/v1/templates/${id}/usage`,
    DOWNLOAD: (id: string) => `/api/v1/templates/${id}/download`,
  },
} as const;
