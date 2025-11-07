/**
 * History Store
 *
 * Undo/Redo 기능을 위한 히스토리 관리 스토어
 * 워크플로우의 노드와 엣지 상태 변경을 추적합니다.
 */

import { create } from 'zustand';
import type { Node, Edge } from '@/shared/types/workflow.types';

interface HistoryState {
  past: Array<{ nodes: Node[]; edges: Edge[] }>;
  present: { nodes: Node[]; edges: Edge[] } | null;
  future: Array<{ nodes: Node[]; edges: Edge[] }>;

  push: (nodes: Node[], edges: Edge[]) => void;
  undo: () => { nodes: Node[]; edges: Edge[] } | null;
  redo: () => { nodes: Node[]; edges: Edge[] } | null;
  reset: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  push: (nodes, edges) => {
    const { present, past } = get();

    if (present) {
      set({
        past: [...past, present],
        present: { nodes, edges },
        future: [], // 새 작업 시 future 초기화
      });
    } else {
      set({ present: { nodes, edges } });
    }
  },

  undo: () => {
    const { past, present, future } = get();

    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    if (present) {
      set({
        past: newPast,
        present: previous,
        future: [present, ...future],
      });
    }

    return previous;
  },

  redo: () => {
    const { past, present, future } = get();

    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    if (present) {
      set({
        past: [...past, present],
        present: next,
        future: newFuture,
      });
    }

    return next;
  },

  reset: () => {
    set({ past: [], present: null, future: [] });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
