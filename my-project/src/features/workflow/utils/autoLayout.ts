import type { Edge, Node } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

type LayoutOptions = {
  horizontalGap?: number;
  verticalGap?: number;
  marginX?: number;
  marginY?: number;
};

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  horizontalGap: 340,
  verticalGap: 200,
  marginX: 80,
  marginY: 120,
};

const blockPriority: Record<BlockEnum, number> = {
  [BlockEnum.Start]: 0,
  [BlockEnum.KnowledgeRetrieval]: 1,
  [BlockEnum.LLM]: 2,
  [BlockEnum.End]: 3,
};

const getTypePriority = (node?: Node): number => {
  const type = node?.data.type as BlockEnum | undefined;
  if (type !== undefined) {
    return blockPriority[type];
  }
  return blockPriority[BlockEnum.LLM];
};

const sortByCurrentAppearance = (a: Node | undefined, b: Node | undefined) => {
  const yDiff = (a?.position?.y ?? 0) - (b?.position?.y ?? 0);
  if (yDiff !== 0) {
    return yDiff;
  }

  const typeDiff = getTypePriority(a) - getTypePriority(b);
  if (typeDiff !== 0) {
    return typeDiff;
  }

  return (a?.id ?? '').localeCompare(b?.id ?? '');
};

/**
 * LangFlow와 유사한 좌→우 자동 배치를 계산합니다.
 * - 위상 정렬 기반으로 레벨을 구하고 각 레벨을 열(Column)로 간주합니다.
 * - 레벨 내 노드들은 기존 Y 좌표를 우선시하여 겹침을 줄입니다.
 */
export const computeWorkflowAutoLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] => {
  if (nodes.length === 0) {
    return nodes;
  }

  const settings = { ...DEFAULT_OPTIONS, ...options };
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacency.set(node.id, new Set());
    indegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (!adjacency.has(edge.source) || !indegree.has(edge.target)) {
      return;
    }

    const neighbours = adjacency.get(edge.source)!;
    if (!neighbours.has(edge.target)) {
      neighbours.add(edge.target);
      indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    }
  });

  const queue: string[] = [];
  indegree.forEach((degree, id) => {
    if (degree === 0) {
      queue.push(id);
    }
  });
  queue.sort((a, b) =>
    sortByCurrentAppearance(nodeMap.get(a), nodeMap.get(b))
  );

  const visited = new Set<string>();
  const levels = new Map<string, number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.add(current);

    const nextLevel = (levels.get(current) ?? 0) + 1;
    const neighbours = adjacency.get(current);
    if (!neighbours) continue;

    [...neighbours]
      .sort((a, b) =>
        sortByCurrentAppearance(nodeMap.get(a), nodeMap.get(b))
      )
      .forEach((targetId) => {
        const remaining = (indegree.get(targetId) ?? 0) - 1;
        indegree.set(targetId, remaining);

        const prevLevel = levels.get(targetId);
        if (!prevLevel || nextLevel > prevLevel) {
          levels.set(targetId, nextLevel);
        }

        if (remaining === 0) {
          queue.push(targetId);
          queue.sort((a, b) =>
            sortByCurrentAppearance(nodeMap.get(a), nodeMap.get(b))
          );
        }
      });
  }

  if (visited.size !== nodes.length) {
    const unresolved = nodes.filter((node) => !visited.has(node.id));
    unresolved.forEach((node) => {
      const parentLevels = edges
        .filter((edge) => edge.target === node.id)
        .map((edge) => levels.get(edge.source) ?? 0);
      const fallback = parentLevels.length > 0 ? Math.max(...parentLevels) : 0;
      levels.set(node.id, fallback + 1);
    });
  }

  const columns = new Map<number, Node[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    const column = columns.get(level) ?? [];
    column.push(node);
    columns.set(level, column);
  });

  const maxRows =
    Math.max(...Array.from(columns.values()).map((column) => column.length)) ||
    1;
  const canvasHeight = (maxRows - 1) * settings.verticalGap;

  const assignedPositions = new Map<string, { x: number; y: number }>();
  const sortedLevels = Array.from(columns.keys()).sort((a, b) => a - b);

  sortedLevels.forEach((level) => {
    const columnNodes = columns.get(level)!;
    columnNodes.sort(sortByCurrentAppearance);

    const columnHeight = (columnNodes.length - 1) * settings.verticalGap;
    const columnStartY =
      settings.marginY + Math.max(0, (canvasHeight - columnHeight) / 2);

    columnNodes.forEach((node, index) => {
      const x = settings.marginX + level * settings.horizontalGap;
      const y = columnStartY + index * settings.verticalGap;
      assignedPositions.set(node.id, { x, y });
    });
  });

  return nodes.map((node) => {
    const position = assignedPositions.get(node.id);
    if (!position) {
      return node;
    }

    return {
      ...node,
      position,
      dragging: false,
    };
  });
};
