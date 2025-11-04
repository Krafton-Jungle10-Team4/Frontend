import { useEffect, useRef } from 'react';
import { BlockEnum } from '../../types/workflow.types';

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

  const nodeTypes = [
    { type: BlockEnum.Start, label: 'Start Node', icon: '▶️' },
    { type: BlockEnum.LLM, label: 'LLM Node', icon: '🤖' },
    { type: BlockEnum.KnowledgeRetrieval, label: 'Knowledge Retrieval', icon: '📚' },
    { type: BlockEnum.End, label: 'End Node', icon: '🏁' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {/* 노드 삭제 */}
      {onDeleteNode && (
        <button
          onClick={onDeleteNode}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>Delete Node</span>
        </button>
      )}

      {/* 엣지 삭제 */}
      {onDeleteEdge && (
        <button
          onClick={onDeleteEdge}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
        >
          <span>✂️</span>
          <span>Delete Connection</span>
        </button>
      )}

      {/* 노드 추가 */}
      {onAddNode && (
        <>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
            Add Node
          </div>
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => onAddNode(nodeType.type)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 flex items-center gap-2"
            >
              <span>{nodeType.icon}</span>
              <span>{nodeType.label}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default ContextMenu;
