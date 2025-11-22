/**
 * NodeSelector 컴포넌트 타입 정의
 */

import type { NodeTypeResponse } from '../../types/api.types';

/**
 * 노드 카테고리
 */
export enum NodeCategory {
  Default = 'default',
  QuestionUnderstand = 'question-understand',
  Logic = 'logic',
  Transform = 'transform',
  Utilities = 'utilities',
}

/**
 * 탭 타입
 */
export enum TabType {
  Nodes = 'nodes',
  Tools = 'tools',
}

/**
 * 그룹화된 노드 타입
 */
export type GroupedNodes = Record<NodeCategory, NodeTypeResponse[]>;

/**
 * NodeSelector Props
 */
export interface NodeSelectorProps {
  nodes: NodeTypeResponse[];
  onSelect: (nodeType: NodeTypeResponse) => void;
  onClose: () => void;
  position: { x: number; y: number };
  showToolsTab?: boolean;
}

/**
 * SearchInput Props
 */
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * NodeSelectorTabs Props
 */
export interface NodeSelectorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showToolsTab?: boolean;
}

/**
 * NodeList Props
 */
export interface NodeListProps {
  groups: GroupedNodes;
  onSelect: (nodeType: NodeTypeResponse) => void;
}

/**
 * NodeItem Props
 */
export interface NodeItemProps {
  node: NodeTypeResponse;
  onSelect: () => void;
}

/**
 * BlockIcon Props
 */
export interface BlockIconProps {
  type: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}
