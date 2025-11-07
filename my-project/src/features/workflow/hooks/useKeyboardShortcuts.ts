/**
 * Keyboard Shortcuts Hook
 *
 * Undo/Redo를 위한 키보드 단축키를 처리합니다.
 * - Ctrl+Z (또는 Cmd+Z): Undo
 * - Ctrl+Shift+Z (또는 Cmd+Shift+Z): Redo
 * - Ctrl+Y (또는 Cmd+Y): Redo (대체)
 */

import { useEffect } from 'react';
import { useHistoryStore } from '../stores/historyStore';
import { useWorkflowStore } from '../stores/workflowStore';

export const useKeyboardShortcuts = () => {
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl+Z / Cmd+Z: Undo
      if (modKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        if (canUndo()) {
          const previous = undo();
          if (previous) {
            setNodes(previous.nodes);
            setEdges(previous.edges);
          }
        }
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z: Redo
      if (modKey && event.shiftKey && event.key === 'z') {
        event.preventDefault();
        if (canRedo()) {
          const next = redo();
          if (next) {
            setNodes(next.nodes);
            setEdges(next.edges);
          }
        }
      }

      // Ctrl+Y / Cmd+Y: Redo (대체)
      if (modKey && !event.shiftKey && event.key === 'y') {
        event.preventDefault();
        if (canRedo()) {
          const next = redo();
          if (next) {
            setNodes(next.nodes);
            setEdges(next.edges);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo, setNodes, setEdges]);
};
