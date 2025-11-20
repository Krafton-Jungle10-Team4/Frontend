/**
 * Workflow 데이터 모델 정의
 * Phase 4: 데이터 모델 및 상태 관리 재설계
 */

export type WorkflowStatus = 'running' | 'stopped' | 'error' | 'pending';
export type DeploymentState = 'deployed' | 'stopped' | 'error' | 'deploying';
export type MarketplaceState = 'published' | 'unpublished' | 'pending';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: BotCategory;
  status: WorkflowStatus;
  tags: string[];
  latestVersion: string;
  latestVersionId?: string;
  versions: WorkflowVersion[];
  previousVersionCount: number;
  deploymentState: DeploymentState;
  deploymentUrl?: string;
  lastDeployedAt?: Date;
  marketplaceState: MarketplaceState;
  lastPublishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metrics?: WorkflowMetrics;
}

export interface WorkflowVersion {
  id: string;
  version: string;
  commitHash?: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  performance?: {
    avgResponseTime: number;
    estimatedCost: number;
    successRate: number;
  };
  isABTest?: boolean;
  trafficPercentage?: number;
}

export interface WorkflowMetrics {
  totalRuns: number;
  successRate: number;
  avgResponseTime: number;
  lastRunAt?: Date;
  monthlyUsage: number;
  estimatedCost: number;
}

export interface WorkflowFilters {
  search: string;
  tags: string[];
  status: WorkflowStatus | 'all';
}

export interface WorkflowStats {
  total: number;
  running: number;
  stopped: number;
  error: number;
  pending: number;
}

export type SortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc';

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  workflow: WorkflowDefinition;
  session_id?: string;
  category?: BotCategory;
  tags?: string[];
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  workflow?: WorkflowDefinition;
  category?: BotCategory;
  tags?: string[];
}

export interface WorkflowDefinition {
  schemaVersion: string;
  workflowRevision: number;
  projectId?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export type BotCategory = 'workflow' | 'chatflow' | 'chatbot' | 'agent';

export interface DeployConfig {
  workflow_version_id: string;
  status?: 'draft' | 'published' | 'suspended';
  allowed_domains?: string[];
  widget_config: {
    theme?: 'light' | 'dark' | 'auto';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    auto_open?: boolean;
    auto_open_delay?: number;
    welcome_message?: string;
    placeholder_text?: string;
    primary_color?: string;
    bot_name?: string;
    avatar_url?: string | null;
    show_typing_indicator?: boolean;
    enable_file_upload?: boolean;
    max_file_size_mb?: number;
    allowed_file_types?: string[];
    enable_feedback?: boolean;
    enable_sound?: boolean;
    save_conversation?: boolean;
    conversation_storage?: 'localStorage' | 'sessionStorage';
    custom_css?: string;
    custom_js?: string;
  };
}

export interface PublishConfig {
  workflow_version_id: string;
  display_name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  screenshots?: string[];
  readme?: string;
  use_cases?: string[];
}

export interface ABTestConfig {
  versionA: string;
  versionB: string;
  trafficSplit: {
    versionA: number;
    versionB: number;
  };
  metrics: string[];
  duration: number;
}

export {
  PortType,
  type PortDefinition,
  type NodePortSchema,
  type PortValue,
  type PortValues,
} from './workflow/port.types';

export {
  type ValueSelector,
  type VariableMapping,
  type NodeVariableMappings,
  type VariableReference,
  type VariablePoolState,
} from './workflow/variable.types';

export {
  type WorkflowNodeV2,
  type WorkflowEdgeV2,
} from './workflow/node.types';
