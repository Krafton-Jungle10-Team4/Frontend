/**
 * useBotActions Hook
 * Bot 관련 액션(생성, 삭제 등)을 캡슐화한 커스텀 훅
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBotStore } from '../stores/botStore';
import { useActivityStore } from '@/features/activity';
import { useUserStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';

/**
 * Bot 관련 액션을 제공하는 커스텀 훅
 */
export function useBotActions() {
  const navigate = useNavigate();

  // Stores
  const deleteBot = useBotStore((state) => state.deleteBot);
  const addActivity = useActivityStore((state) => state.addActivity);
  const userName = useUserStore((state) => state.userName);
  const language = useUIStore((state) => state.language);

  /**
   * Bot 생성 페이지로 이동
   */
  const handleCreateBot = useCallback(() => {
    navigate('/setup');
  }, [navigate]);

  /**
   * Bot 삭제 및 활동 로그 추가
   */
  const handleDeleteBot = useCallback(
    (botId: string, botName: string) => {
      // Delete bot from store
      deleteBot(botId);

      // Add activity log
      const translations = {
        en: { action: 'deleted bot' },
        ko: { action: '봇을 삭제했습니다' },
      };

      addActivity({
        type: 'bot_deleted',
        botId,
        botName,
        message: `${userName} ${translations[language].action}: ${botName}`,
      });
    },
    [deleteBot, addActivity, userName, language]
  );

  return {
    handleCreateBot,
    handleDeleteBot,
  };
}
