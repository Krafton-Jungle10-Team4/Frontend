/**
 * Workflow Feature - Public API
 *
 * Feature 외부에서 사용할 수 있는 공개 인터페이스
 */

// Components
export { default as Workflow } from './components/WorkflowBuilder';

// Store
export { useWorkflowStore } from './stores/workflowStore';
export { useWorkflowLogStore } from './stores/workflowLogStore';

// Types
export type {
  Node,
  Edge,
  CommonNodeType,
  CommonEdgeType,
  NodeProps,
  StartNodeType,
  LLMNodeType,
  EndNodeType,
  KnowledgeRetrievalNodeType,
  WorkflowData,
} from '@/shared/types/workflow.types';

export { BlockEnum, NodeRunningStatus } from '@/shared/types/workflow.types';

// Template Types
export type {
  WorkflowTemplate,
  WorkflowTemplateSummary,
  TemplateListResponse,
  ExportConfig,
  ExportValidation,
  ImportValidation,
  TemplateOperationResult,
  TemplateGraph,
  PortDefinition,
  TemplateMetadata,
  Author,
} from './types/template.types';

// Routes (Router에서만 사용)
export { workflowRoutes } from './routes';

// Note: Pages are lazy-loaded through routes, not exported directly to avoid bundle issues
