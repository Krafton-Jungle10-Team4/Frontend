/**
 * useBotActions Hook
 * Bot 관련 액션(생성, 삭제 등)을 캡슐화한 커스텀 훅
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBotStore } from '../stores/botStore';
import { useActivityStore } from '@/features/activity';
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { botApi } from '../api/botApi';

/**
 * Bot 관련 액션을 제공하는 커스텀 훅
 */
export function useBotActions() {
  const navigate = useNavigate();

  // Stores
  const deleteBot = useBotStore((state) => state.deleteBot);
  const addActivity = useActivityStore((state) => state.addActivity);
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';
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
    async (botId: string, botName: string) => {
      try {
        // 1. 백엔드 API 호출하여 DB에서 삭제
        await botApi.delete(botId);

        // 2. 로컬 스토어에서도 삭제
        deleteBot(botId);

        // 3. 활동 로그 추가
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
      } catch (error) {
        console.error('Failed to delete bot:', error);

        // 에러 발생 시에도 로컬에서 삭제 (백엔드가 없거나 네트워크 오류인 경우)
        deleteBot(botId);

        // 오류 활동 로그 추가
        const translations = {
          en: { action: 'attempted to delete bot' },
          ko: { action: '봇 삭제를 시도했습니다' },
        };

        addActivity({
          type: 'bot_deleted',
          botId,
          botName,
          message: `${userName} ${translations[language].action}: ${botName} (offline)`,
        });
      }
    },
    [deleteBot, addActivity, userName, language]
  );

  return {
    handleCreateBot,
    handleDeleteBot,
  };
}
