/**
 * useWorkflowShortcuts Hook
 * 워크플로우 빌더에서 사용하는 게시하기 관련 키보드 단축키
 */

import { useEffect } from 'react';
import { usePublishActions } from './usePublishActions';

/**
 * 워크플로우 게시하기 단축키 훅
 *
 * 단축키:
 * - Cmd/Ctrl+Shift+P: 업데이트 게시
 * - Cmd/Ctrl+Shift+E: 사이트에 삽입 모달 열기
 *
 * @param botId 봇 ID
 */
export function useWorkflowShortcuts(botId: string) {
  const { publishUpdate, embedWebsite } = usePublishActions(botId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      const target = e.target as HTMLElement | null;
      const isInputElement =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isInputElement) {
        return;
      }

      // Cmd(Mac) 또는 Ctrl(Windows/Linux) 체크
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            publishUpdate();
            break;
          case 'e':
            e.preventDefault();
            embedWebsite();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [publishUpdate, embedWebsite]);
}
