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

// 노드의 기본 높이 (measured가 없을 때 사용)
const DEFAULT_NODE_HEIGHT = 150;

/**
 * 노드의 handle Y 좌표를 계산합니다 (노드 중심점)
 */
const getNodeHandleY = (node: Node, positionY: number): number => {
  const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
  return positionY + height / 2;
};

const snapToGrid = (value: number, gap: number, offset: number) => {
  if (!gap) {
    return value;
  }
  const snapped = Math.round((value - offset) / gap) * gap + offset;
  return snapped;
};

const resolveCollision = (
  target: number,
  used: number[],
  gap: number,
  minY: number
) => {
  const sorted = [...used].sort((a, b) => a - b);
  const minDistance = gap * 0.6;

  const isFree = (candidate: number) =>
    sorted.every((value) => Math.abs(value - candidate) >= minDistance);

  if (isFree(target) && target >= minY) {
    return target;
  }

  let offset = gap;
  while (offset < gap * 20) {
    const up = target - offset;
    const down = target + offset;

    if (up >= minY && isFree(up)) {
      return up;
    }

    if (isFree(down)) {
      return down;
    }

    offset += gap;
  }

  return Math.max(minY, target);
};

const blockPriority: Record<BlockEnum, number> = {
  [BlockEnum.Start]: 0,
  [BlockEnum.KnowledgeRetrieval]: 1,
  [BlockEnum.LLM]: 2,
  [BlockEnum.MCP]: 2,
  [BlockEnum.Answer]: 2,
  [BlockEnum.KnowledgeBase]: 1,
  [BlockEnum.Code]: 2,
  [BlockEnum.TemplateTransform]: 2,
  [BlockEnum.IfElse]: 2,
  [BlockEnum.VariableAssigner]: 2,
  [BlockEnum.Assigner]: 2,
  [BlockEnum.Http]: 2,
  [BlockEnum.QuestionClassifier]: 2,
  [BlockEnum.TavilySearch]: 2,
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

  const assignedPositions = new Map<string, { x: number; y: number }>();
  const columnUsage = new Map<number, number[]>();
  const sortedLevels = Array.from(columns.keys()).sort((a, b) => a - b);

  sortedLevels.forEach((level) => {
    const columnNodes = columns.get(level)!;
    columnNodes.sort(sortByCurrentAppearance);

    const usedYs = columnUsage.get(level) ?? [];

    columnNodes.forEach((node) => {
      // 현재 노드의 높이
      const nodeHeight = node.measured?.height ?? DEFAULT_NODE_HEIGHT;

      // 부모 노드들의 handle Y 좌표를 수집
      const parentHandleYs = edges
        .filter((edge) => edge.target === node.id)
        .map((edge) => {
          const parentNode = nodeMap.get(edge.source);
          const parentPos = assignedPositions.get(edge.source);
          if (!parentNode || !parentPos) return null;
          return getNodeHandleY(parentNode, parentPos.y);
        })
        .filter((y): y is number => typeof y === 'number');

      let targetHandleY: number;
      if (parentHandleYs.length > 0) {
        // 부모들의 handle Y 좌표 평균
        targetHandleY = parentHandleYs.reduce((sum, value) => sum + value, 0) / parentHandleYs.length;
      } else {
        // 부모가 없으면 기본 위치
        targetHandleY = settings.marginY + nodeHeight / 2 + usedYs.length * settings.verticalGap;
      }

      // handle Y를 기준으로 노드의 position Y를 계산
      let targetY = targetHandleY - nodeHeight / 2;

      targetY = snapToGrid(targetY, settings.verticalGap, settings.marginY);
      const resolvedY = resolveCollision(
        targetY,
        usedYs,
        settings.verticalGap,
        settings.marginY
      );

      usedYs.push(resolvedY);
      columnUsage.set(level, usedYs);

      const x = settings.marginX + level * settings.horizontalGap;
      assignedPositions.set(node.id, { x, y: resolvedY });
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
