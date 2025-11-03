/**
 * Mock bot data for development and testing
 */

import type { BotCardData } from '@/features/bot/components/BotCard/BotCard';

export const mockBots: BotCardData[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    deployedDate: '7AM ⏰ on Nov 1, 2024',
    messages: 1234,
    messageChange: '+162% from last 7 days',
    errors: 5,
    errorStatus: '+2 from last 7 days',
    createdAt: new Date('2024-11-01T07:00:00'),
  },
  {
    id: '2',
    name: 'Sales Assistant',
    deployedDate: '9AM ⏰ on Oct 28, 2024',
    messages: 856,
    messageChange: '+85% from last 7 days',
    errors: 2,
    errorStatus: 'No change',
    createdAt: new Date('2024-10-28T09:00:00'),
  },
  {
    id: '3',
    name: 'Content Writer',
    deployedDate: '2PM ⏰ on Oct 25, 2024',
    messages: 543,
    messageChange: '+45% from last 7 days',
    errors: 0,
    errorStatus: 'No errors',
    createdAt: new Date('2024-10-25T14:00:00'),
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
    deployedDate: `${displayHour}${ampm} ⏰ on ${now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`,
    messages: 0,
    messageChange: 'New bot',
    errors: 0,
    errorStatus: 'No errors',
    createdAt: now,
  };
}
