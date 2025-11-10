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
import { toast } from 'sonner';

/**
 * Bot 관련 액션을 제공하는 커스텀 훅
 */
export function useBotActions() {
  const navigate = useNavigate();

  // Stores
  const deleteBot = useBotStore((state) => state.deleteBot);
  const setBots = useBotStore((state) => state.setBots);
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
      const translations = {
        en: {
          deleting: 'Deleting bot...',
          success: 'Bot deleted successfully',
          alreadyDeleted: 'Bot removed (already deleted)',
          error: 'Failed to delete bot',
        },
        ko: {
          deleting: '봇을 삭제하는 중...',
          success: '봇이 성공적으로 삭제되었습니다',
          alreadyDeleted: '봇을 제거했습니다 (이미 삭제됨)',
          error: '봇 삭제에 실패했습니다',
        },
      };

      const t = translations[language];

      try {
        toast.loading(t.deleting);

        // 1. 백엔드 API 호출하여 DB에서 삭제
        await botApi.delete(botId);

        // 2. 서버에서 최신 목록 가져오기
        const updatedBots = await botApi.getAll();
        setBots(updatedBots);

        // 3. 활동 로그 추가
        addActivity({
          type: 'bot_deleted',
          botId,
          botName,
          message: `${userName} ${language === 'en' ? 'deleted bot' : '봇을 삭제했습니다'}: ${botName}`,
        });

        toast.dismiss();
        toast.success(t.success);
      } catch (error: any) {
        console.error('Failed to delete bot:', error);
        toast.dismiss();

        // 404 에러 처리: 봇이 이미 삭제됨 (정상 처리)
        if (error?.response?.status === 404) {
          // 서버에서 최신 목록 가져오기
          try {
            const updatedBots = await botApi.getAll();
            setBots(updatedBots);
          } catch {
            deleteBot(botId);
          }

          addActivity({
            type: 'bot_deleted',
            botId,
            botName,
            message: `${userName} ${language === 'en' ? 'removed bot (already deleted)' : '봇을 제거했습니다 (이미 삭제됨)'}: ${botName}`,
          });

          toast.success(t.alreadyDeleted);
          return;
        }

        // 네트워크 에러 또는 기타 에러 처리
        // 서버에서 최신 목록 가져오기 시도
        try {
          const updatedBots = await botApi.getAll();
          setBots(updatedBots);
        } catch {
          deleteBot(botId);
        }

        addActivity({
          type: 'bot_deleted',
          botId,
          botName,
          message: `${userName} ${language === 'en' ? 'attempted to delete bot' : '봇 삭제를 시도했습니다'}: ${botName} (offline)`,
        });

        toast.error(t.error);
      }
    },
    [deleteBot, setBots, addActivity, userName, language]
  );

  return {
    handleCreateBot,
    handleDeleteBot,
  };
}
