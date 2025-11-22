/**
 * NodeSelector 커스텀 훅
 */

import { useMemo } from 'react';
import type { NodeTypeResponse } from '../../types/api.types';
import { NodeCategory, type GroupedNodes } from './types';
import { NODE_CATEGORIES } from './constants';

/**
 * 노드 필터링 훅 (검색어 기반)
 */
export function useFilteredNodes(
  nodes: NodeTypeResponse[],
  searchText: string
): NodeTypeResponse[] {
  return useMemo(() => {
    if (!searchText.trim()) return nodes;

    const lowerSearch = searchText.toLowerCase();
    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(lowerSearch) ||
        node.description?.toLowerCase().includes(lowerSearch) ||
        node.type.toLowerCase().includes(lowerSearch)
    );
  }, [nodes, searchText]);
}

/**
 * 노드 그룹화 훅 (카테고리별)
 */
export function useGroupedNodes(nodes: NodeTypeResponse[]): GroupedNodes {
  return useMemo(() => {
    const groups: GroupedNodes = {
      [NodeCategory.Default]: [],
      [NodeCategory.QuestionUnderstand]: [],
      [NodeCategory.Logic]: [],
      [NodeCategory.Transform]: [],
      [NodeCategory.Utilities]: [],
    };

    nodes.forEach((node) => {
      const category = NODE_CATEGORIES[node.type] || NodeCategory.Default;
      groups[category].push(node);
    });

    return groups;
  }, [nodes]);
}
