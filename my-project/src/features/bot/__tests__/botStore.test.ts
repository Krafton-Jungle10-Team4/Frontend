/**
 * Bot Store 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useBotStore,
  selectBotsCount,
  selectActiveBots,
} from '../stores/botStore';
import type { Bot } from '../types/bot.types';

describe('botStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    const { reset } = useBotStore.getState();
    reset();
  });

  describe('Bot 추가', () => {
    it('새로운 Bot을 추가할 수 있어야 한다', () => {
      const { addBot, bots } = useBotStore.getState();

      const newBot: Bot = {
        id: 'test-bot-1',
        name: 'Test Bot',
        description: 'Test Description',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBot(newBot);

      expect(bots).toHaveLength(1);
      expect(bots[0]).toEqual(newBot);
    });

    it('중복된 ID의 Bot을 추가하면 업데이트되어야 한다', () => {
      const { addBot, bots } = useBotStore.getState();

      const bot: Bot = {
        id: 'test-bot-1',
        name: 'Original Name',
        description: 'Original Description',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBot(bot);

      const updatedBot: Bot = {
        ...bot,
        name: 'Updated Name',
      };

      addBot(updatedBot);

      expect(bots).toHaveLength(1);
      expect(bots[0].name).toBe('Updated Name');
    });
  });

  describe('Bot 삭제', () => {
    it('Bot을 삭제할 수 있어야 한다', () => {
      const { addBot, deleteBot, bots } = useBotStore.getState();

      const bot: Bot = {
        id: 'test-bot-1',
        name: 'Test Bot',
        description: 'Test Description',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBot(bot);
      expect(bots).toHaveLength(1);

      deleteBot('test-bot-1');
      expect(bots).toHaveLength(0);
    });

    it('존재하지 않는 Bot을 삭제하려 해도 에러가 발생하지 않아야 한다', () => {
      const { deleteBot } = useBotStore.getState();

      expect(() => deleteBot('non-existent-id')).not.toThrow();
    });
  });

  describe('Bot 선택', () => {
    it('Bot을 선택할 수 있어야 한다', () => {
      const { setSelectedBotId, selectedBotId } = useBotStore.getState();

      setSelectedBotId('test-bot-1');

      expect(selectedBotId).toBe('test-bot-1');
    });

    it('선택을 해제할 수 있어야 한다', () => {
      const { setSelectedBotId, selectedBotId } = useBotStore.getState();

      setSelectedBotId('test-bot-1');
      expect(selectedBotId).toBe('test-bot-1');

      setSelectedBotId(null);
      expect(selectedBotId).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('selectBotsCount는 정확한 Bot 수를 반환해야 한다', () => {
      const { addBot } = useBotStore.getState();

      const bot1: Bot = {
        id: 'test-bot-1',
        name: 'Bot 1',
        description: 'Description 1',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const bot2: Bot = {
        id: 'test-bot-2',
        name: 'Bot 2',
        description: 'Description 2',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBot(bot1);
      addBot(bot2);

      expect(selectBotsCount(useBotStore.getState())).toBe(2);
    });

    it('selectActiveBots는 활성화된 Bot만 반환해야 한다', () => {
      const { addBot } = useBotStore.getState();

      const activeBot: Bot = {
        id: 'active-bot',
        name: 'Active Bot',
        description: 'Active',
        status: 'active',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const inactiveBot: Bot = {
        id: 'inactive-bot',
        name: 'Inactive Bot',
        description: 'Inactive',
        status: 'inactive',
        messagesCount: 0,
        errorsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addBot(activeBot);
      addBot(inactiveBot);

      const activeBots = selectActiveBots(useBotStore.getState());
      expect(activeBots).toHaveLength(1);
      expect(activeBots[0].status).toBe('active');
    });
  });
});
