/**
 * Mock bot data for development and testing
 */

import type { BotCardData } from '@/features/bot/components/BotCard/BotCard';

export const mockBots: BotCardData[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    deployedDate: '7AM ⏰ on Nov 1, 2024',
    createdAt: new Date('2024-11-01T07:00:00'),
    nodeCount: 18,
    edgeCount: 42,
    estimatedCost: 48.5,
  },
  {
    id: '2',
    name: 'Sales Assistant',
    deployedDate: '9AM ⏰ on Oct 28, 2024',
    createdAt: new Date('2024-10-28T09:00:00'),
    nodeCount: 12,
    edgeCount: 27,
    estimatedCost: 35.2,
  },
  {
    id: '3',
    name: 'Content Writer',
    deployedDate: '2PM ⏰ on Oct 25, 2024',
    createdAt: new Date('2024-10-25T14:00:00'),
    nodeCount: 9,
    edgeCount: 19,
    estimatedCost: 21.8,
  },
];

export function createMockBot(name: string): BotCardData {
  const now = new Date();
  const hour = now.getHours();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return {
    id: `bot_${Date.now()}`,
    name,
    deployedDate: `${displayHour}${ampm} ⏰ on ${now.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )}`,
    createdAt: now,
    nodeCount: 5,
    edgeCount: 9,
    estimatedCost: 4.5,
  };
}
