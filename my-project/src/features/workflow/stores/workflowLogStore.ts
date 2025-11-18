import { create } from 'zustand';
import { workflowApi } from '../api/workflowApi';
import type {
  WorkflowLogFilters,
  WorkflowRunSummary,
} from '../types/log.types';

const DEFAULT_LIMIT = 20;

type PaginationState = {
  limit: number;
  offset: number;
  total: number;
};

interface WorkflowLogState {
  runs: WorkflowRunSummary[];
  selectedRunId: string | null;
  filters: WorkflowLogFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  loadRuns: (botId: string, options?: { append?: boolean }) => Promise<void>;
  setFilters: (next: Partial<WorkflowLogFilters>) => void;
  selectRun: (runId: string | null) => void;
  reset: () => void;
}

const initialState: Pick<WorkflowLogState, 'runs' | 'selectedRunId' | 'filters' | 'pagination' | 'isLoading' | 'error'> = {
  runs: [],
  selectedRunId: null,
  filters: {},
  pagination: {
    limit: DEFAULT_LIMIT,
    offset: 0,
    total: 0,
  },
  isLoading: false,
  error: null,
};

export const useWorkflowLogStore = create<WorkflowLogState>((set, get) => ({
  ...initialState,

  async loadRuns(botId, options) {
    if (!botId) {
      set({ runs: [], selectedRunId: null, pagination: { ...initialState.pagination } });
      return;
    }

    const { filters, pagination } = get();
    const nextOffset = options?.append ? pagination.offset + pagination.limit : 0;

    const params: Record<string, string | number> = {
      limit: pagination.limit,
      offset: nextOffset,
    };

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }
    if (filters.startDate) {
      params.start_date = filters.startDate.toISOString();
    }
    if (filters.endDate) {
      params.end_date = filters.endDate.toISOString();
    }
    if (filters.searchQuery) {
      params.search = filters.searchQuery;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await workflowApi.listWorkflowRuns(botId, params);
      const mergedRuns = options?.append
        ? [...get().runs, ...response.runs]
        : response.runs;

      set({
        runs: mergedRuns,
        pagination: {
          limit: response.limit,
          offset: response.offset,
          total: response.total,
        },
        selectedRunId: mergedRuns.length > 0 ? mergedRuns[0].id : null,
      });
    } catch (error) {
      console.error('Failed to load workflow logs:', error);
      set({ error: 'Failed to load workflow logs.' });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters(next) {
    set((state) => ({
      filters: {
        ...state.filters,
        ...next,
      },
      pagination: { ...state.pagination, offset: 0 },
    }));
  },

  selectRun(runId) {
    set({ selectedRunId: runId });
  },

  reset() {
    set(initialState);
  },
}));
