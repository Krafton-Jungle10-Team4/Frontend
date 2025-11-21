/**
 * Workflow Store
 * Phase 4: 데이터 모델 및 상태 관리 재설계
 */

import { create } from 'zustand';
import {
  Workflow,
  WorkflowFilters,
  SortOption,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  DeployConfig,
  PublishConfig,
  WorkflowVersion,
  ABTestConfig,
  WorkflowStatus,
  DeploymentState,
  MarketplaceState,
  WorkflowStats,
} from '@shared/types/workflow';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/constants/apiEndpoints';

interface WorkflowStore {
  // State
  workflows: Workflow[];
  loading: boolean;
  error: Error | null;
  filters: WorkflowFilters;
  sortBy: SortOption;
  availableTags: string[];
  stats: WorkflowStats;

  // Actions
  fetchWorkflows: () => Promise<void>;
  createWorkflow: (data: CreateWorkflowDto) => Promise<Workflow>;
  updateWorkflow: (id: string, data: UpdateWorkflowDto) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;

  // Filter & Sort
  setFilters: (filters: Partial<WorkflowFilters>) => void;
  setSortBy: (sortBy: SortOption) => void;

  // Deployment
  deployWorkflow: (id: string, config: DeployConfig) => Promise<void>;
  stopDeployment: (id: string) => Promise<void>;

  // Marketplace
  publishToMarketplace: (id: string, config: PublishConfig) => Promise<void>;
  unpublishFromMarketplace: (id: string) => Promise<void>;

  // Version Management
  fetchVersionHistory: (id: string) => Promise<WorkflowVersion[]>;
  switchVersion: (workflowId: string, versionId: string) => Promise<void>;
  createABTest: (workflowId: string, config: ABTestConfig) => Promise<void>;
}

const mapWorkflowStatus = (status?: string | null): WorkflowStatus => {
  switch (status) {
    case 'running':
    case 'active':
      return 'running';
    case 'pending':
      return 'pending';
    case 'error':
      return 'error';
    default:
      return 'stopped';
  }
};

const mapDeploymentState = (state?: string | null): DeploymentState => {
  switch (state) {
    case 'deployed':
    case 'published':
      return 'deployed';
    case 'deploying':
    case 'draft':
      return 'deploying';
    case 'error':
    case 'disabled':
    case 'suspended':
      return 'error';
    default:
      return 'stopped';
  }
};

const mapMarketplaceState = (state?: string | null): MarketplaceState => {
  switch (state) {
    case 'published':
      return 'published';
    case 'pending':
      return 'pending';
    default:
      return 'unpublished';
  }
};

const mapStatsFromWorkflows = (workflows: Workflow[]): WorkflowStats => ({
  total: workflows.length,
  running: workflows.filter((w) => w.status === 'running').length,
  stopped: workflows.filter((w) => w.status === 'stopped').length,
  error: workflows.filter((w) => w.status === 'error').length,
  pending: workflows.filter((w) => w.status === 'pending').length,
  deployed: workflows.filter((w) => w.deploymentState === 'deployed').length,
});

const normalizeWorkflow = (item: any): Workflow => ({
  id: item.id,
  name: item.name,
  description: item.description ?? undefined,
  category: (item.category as Workflow['category']) ?? 'workflow',
  status: mapWorkflowStatus(item.status),
  tags: item.tags ?? [],
  latestVersion: item.latestVersion ?? 'v0.0',
  latestVersionId: item.latestVersionId ?? undefined,
  versions: [],
  previousVersionCount: item.previousVersionCount ?? 0,
  deploymentState: mapDeploymentState(item.deploymentState),
  deploymentUrl: item.deploymentUrl ?? undefined,
  lastDeployedAt: item.lastDeployedAt
    ? new Date(item.lastDeployedAt)
    : undefined,
  marketplaceState: mapMarketplaceState(item.marketplaceState),
  lastPublishedAt: item.lastPublishedAt
    ? new Date(item.lastPublishedAt)
    : undefined,
  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
  updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  createdBy: item.createdBy?.toString() ?? '',
  metrics: undefined,
});

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    tags: [],
    status: 'all',
  },
  sortBy: 'recent',
  availableTags: [],
  stats: {
    total: 0,
    running: 0,
    stopped: 0,
    error: 0,
    pending: 0,
    deployed: 0,
  },

  fetchWorkflows: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, sortBy } = get();

      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '100');

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }

      const sortMapping: Record<SortOption, string> = {
        recent: 'updatedAt:desc',
        oldest: 'updatedAt:asc',
        'name-asc': 'name:asc',
        'name-desc': 'name:desc',
      };
      params.append('sort', sortMapping[sortBy] || 'updatedAt:desc');

      const response = await apiClient.get(`${API_ENDPOINTS.STUDIO.WORKFLOWS}?${params.toString()}`);
      const payload = response.data ?? {};
      const workflows = (payload.data ?? []).map(normalizeWorkflow);
      const statsFromApi = payload.stats as Partial<WorkflowStats> | undefined;
      const stats: WorkflowStats = {
        ...mapStatsFromWorkflows(workflows),
        ...statsFromApi,
      } as WorkflowStats;
      const availableTags: string[] = payload.filters?.availableTags
        ? [...payload.filters.availableTags].sort()
        : Array.from(new Set(workflows.flatMap((workflow) => workflow.tags))).sort();

      set({ workflows, availableTags, stats, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  createWorkflow: async (data: CreateWorkflowDto) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOTS.CREATE, data);
      await get().fetchWorkflows();
      const createdId = response.data?.data?.id;
      const createdWorkflow = createdId
        ? get().workflows.find((workflow) => workflow.id === createdId)
        : undefined;
      return (
        createdWorkflow ||
        normalizeWorkflow({
          ...(response.data?.data ?? {}),
          status: response.data?.data?.isActive ? 'running' : 'stopped',
        })
      );
    } catch (error) {
      throw error;
    }
  },

  updateWorkflow: async (id: string, data: UpdateWorkflowDto) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.BOTS.UPDATE(id), data);
      const updatedData = response.data?.data ?? response.data;
      const updatedWorkflow = normalizeWorkflow(updatedData);

      set((state) => {
        // 워크플로우 업데이트
        const workflows = state.workflows.map((workflow) =>
          workflow.id === id ? updatedWorkflow : workflow
        );

        // 현재 sortBy에 따라 정렬
        const sorted = [...workflows];
        switch (state.sortBy) {
          case 'recent':
            sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            break;
          case 'oldest':
            sorted.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
            break;
          case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        }

        return {
          workflows: sorted,
          availableTags: Array.from(new Set(sorted.flatMap((w) => w.tags))).sort(),
        };
      });
    } catch (error) {
      throw error;
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.BOTS.DELETE(id));
      set((state) => {
        const updated = state.workflows.filter((workflow) => workflow.id !== id);
        return {
          workflows: updated,
          stats: mapStatsFromWorkflows(updated),
          availableTags: Array.from(new Set(updated.flatMap((w) => w.tags))).sort(),
        };
      });
    } catch (error) {
      throw error;
    }
  },

  setFilters: (filters: Partial<WorkflowFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchWorkflows();
  },

  setSortBy: (sortBy: SortOption) => {
    set({ sortBy });
    get().fetchWorkflows();
  },

  deployWorkflow: async (id: string, config: DeployConfig) => {
    try {
      await apiClient.post(API_ENDPOINTS.BOTS.DEPLOY(id), config);
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },

  stopDeployment: async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.BOTS.DEPLOYMENT(id));
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },

  publishToMarketplace: async (id: string, config: PublishConfig) => {
    try {
      await apiClient.post('/api/v1/marketplace/publish', config);
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },

  unpublishFromMarketplace: async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/marketplace/${id}`);
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },

  fetchVersionHistory: async (id: string) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSIONS(id)
      );
      const versions: WorkflowVersion[] = response.data.map((v: any) => ({
        id: v.id,
        version: v.version,
        commitHash: undefined,
        description: v.library_description,
        createdAt: new Date(v.created_at),
        createdBy: '',
        performance: {
          avgResponseTime: 0,
          estimatedCost: 0,
          successRate: 0,
        },
        isABTest: false,
        trafficPercentage: undefined,
      }));
      return versions;
    } catch (error) {
      throw error;
    }
  },

  switchVersion: async (workflowId: string, versionId: string) => {
    try {
      await apiClient.post(
        API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSION_PUBLISH(workflowId, versionId)
      );
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },

  createABTest: async (workflowId: string, config: ABTestConfig) => {
    try {
      console.log('A/B Test configuration for workflow:', workflowId, config);
      await get().fetchWorkflows();
    } catch (error) {
      throw error;
    }
  },
}));
