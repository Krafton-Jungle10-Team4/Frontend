/**
 * useBotCreateDialog Hook
 * 봇 생성 다이얼로그 상태 및 봇 생성 로직 관리
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { botApi } from '../api/botApi';
import { useBotStore } from '../stores/botStore';
import { useActivityStore } from '@features/activity';
import { useAuthStore } from '@features/auth';
import { useUIStore } from '@shared/stores/uiStore';
import { buildMinimalWorkflow } from '../utils/workflowUtils';

interface CreateBotInput {
  name: string;
  description?: string;
}

const translations = {
  en: {
    creating: 'Creating bot...',
    success: 'Bot created successfully',
    error: 'Failed to create bot',
    nameRequired: 'Bot name is required',
    activityCreated: 'created a bot',
  },
  ko: {
    creating: '서비스를 생성하는 중...',
    success: '서비스가 성공적으로 생성되었습니다',
    error: '서비스 생성에 실패했습니다',
    nameRequired: '서비스 이름은 필수입니다',
    activityCreated: '서비스를 생성했습니다',
  },
};

export function useBotCreateDialog() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const addBot = useBotStore((state) => state.addBot);
  const addActivity = useActivityStore((state) => state.addActivity);
  const user = useAuthStore((state) => state.user);
  const language = useUIStore((state) => state.language);

  const userName = user?.name || 'User';
  const t = translations[language];

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const createBot = useCallback(
    async (input: CreateBotInput) => {
      if (!input.name.trim()) {
        toast.error(t.nameRequired);
        return;
      }

      setIsCreating(true);

      try {
        // Bot 생성 API 호출
        const newBot = await botApi.create({
          name: input.name.trim(),
          goal: input.description?.trim() || undefined,
          workflow: buildMinimalWorkflow(),
        });

        // Zustand 스토어에 추가
        addBot(newBot);

        // 활동 로그 추가
        addActivity({
          type: 'bot_created',
          botId: newBot.id,
          botName: newBot.name,
          message: `${userName} ${t.activityCreated}: ${newBot.name}`,
        });

        // 다이얼로그 닫기
        closeDialog();

        // 워크플로우 페이지로 이동
        navigate(`/bot/${newBot.id}/workflow`, {
          state: { botName: newBot.name, showSuccessToast: true },
        });
      } catch (error) {
        console.error('Failed to create bot:', error);
        toast.error(t.error);
      } finally {
        setIsCreating(false);
      }
    },
    [addBot, addActivity, userName, navigate, closeDialog, t]
  );

  return {
    isOpen,
    isCreating,
    openDialog,
    closeDialog,
    createBot,
  };
}
