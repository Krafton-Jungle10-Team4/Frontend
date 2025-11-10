import { useEffect, useRef, useState } from 'react';
import { BlockEnum } from '@/shared/types/workflow.types';
import { workflowApi } from '../../api/workflowApi';
import type { NodeTypeResponse } from '../../types/api.types';

// 아이콘 매핑
const ICON_MAP: Record<string, string> = {
  play: '▶️',
  brain: '🤖',
  book: '📚',
  flag: '🏁',
};

// Fallback 노드 타입 (백엔드 API 실패 시 사용)
const FALLBACK_NODE_TYPES: NodeTypeResponse[] = [
  { type: 'start', label: 'Start', icon: 'play', max_instances: 1, configurable: false },
  { type: 'llm', label: 'LLM', icon: 'brain', max_instances: -1, configurable: true },
  { type: 'knowledge-retrieval', label: 'Knowledge Retrieval', icon: 'book', max_instances: -1, configurable: true },
  { type: 'end', label: 'End', icon: 'flag', max_instances: 1, configurable: false },
];

// 아이콘 문자열을 이모지로 변환
const getIconEmoji = (icon: string): string => ICON_MAP[icon] || '📦';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDeleteNode?: () => void;
  onDeleteEdge?: () => void;
  onAddNode?: (nodeType: BlockEnum) => void;
}

/**
 * 워크플로우 캔버스 컨텍스트 메뉴
 * 노드/엣지 추가 및 삭제 기능 제공
 */
const ContextMenu = ({
  x,
  y,
  onClose,
  onDeleteNode,
  onDeleteEdge,
  onAddNode,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [nodeTypes, setNodeTypes] = useState<NodeTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 동적 노드 타입 로드
  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        const types = await workflowApi.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error('Failed to load node types:', error);
        setNodeTypes(FALLBACK_NODE_TYPES);
      } finally {
        setLoading(false);
      }
    };

    loadNodeTypes();
  }, []);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {/* 노드 삭제 */}
      {onDeleteNode && (
        <button
          onClick={onDeleteNode}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>Delete Node</span>
        </button>
      )}

      {/* 엣지 삭제 */}
      {onDeleteEdge && (
        <button
          onClick={onDeleteEdge}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <span>✂️</span>
          <span>Delete Connection</span>
        </button>
      )}

      {/* 노드 추가 */}
      {onAddNode && (
        <>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Add Node
          </div>
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Loading node types...
            </div>
          ) : (
            nodeTypes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => onAddNode(nodeType.type as BlockEnum)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <span>{getIconEmoji(nodeType.icon)}</span>
                <span>{nodeType.label}</span>
              </button>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default ContextMenu;
