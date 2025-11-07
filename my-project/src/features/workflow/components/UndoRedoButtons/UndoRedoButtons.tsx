/**
 * Undo/Redo Buttons Component
 *
 * 워크플로우 빌더에서 실행 취소/다시 실행 버튼을 제공합니다.
 */

import { Button } from '@shared/components/button';
import { Undo2, Redo2 } from 'lucide-react';
import { useHistoryStore } from '../../stores/historyStore';
import { useWorkflowStore } from '../../stores/workflowStore';

export const UndoRedoButtons = () => {
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { setNodes, setEdges } = useWorkflowStore();

  const handleUndo = () => {
    if (canUndo()) {
      const previous = undo();
      if (previous) {
        setNodes(previous.nodes);
        setEdges(previous.edges);
      }
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      const next = redo();
      if (next) {
        setNodes(next.nodes);
        setEdges(next.edges);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleUndo}
        disabled={!canUndo()}
        variant="outline"
        size="icon"
        title="실행 취소 (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        onClick={handleRedo}
        disabled={!canRedo()}
        variant="outline"
        size="icon"
        title="다시 실행 (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
