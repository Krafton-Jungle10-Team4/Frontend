/**
 * BasePanel
 *
 * 모든 노드 설정 패널의 기본 래퍼 컴포넌트
 * 공통 UI (헤더, 탭, 닫기 버튼)를 제공
 */

import { useWorkflowStore } from '../../../stores/workflowStore';
import { X } from 'lucide-react';
import { Input } from '@shared/components/input';
import BlockIcon from './block-icon';

interface BasePanelProps {
  children: React.ReactNode;
}

export const BasePanel = ({ children }: BasePanelProps) => {
  const { selectedNodeId, nodes, updateNode, selectNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  const handleClose = () => {
    selectNode(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 공통 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BlockIcon type={node.data.type} size="sm" />
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {node.data.title || node.data.type}
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
          title="닫기"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* 공통 설명 필드 */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          value={node.data.desc || ''}
          onChange={(e) => handleUpdate('desc', e.target.value)}
          placeholder="설명 추가..."
          className="text-xs text-gray-500 dark:text-gray-400 border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* 공통 탭 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
            설정
          </button>
        </div>
      </div>

      {/* 노드별 설정 내용 (children) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};
