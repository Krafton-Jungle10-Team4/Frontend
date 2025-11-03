/**
 * Mock activity data for development and testing
 */

import type { Activity } from '../components/RightSidebar';

export const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'published a bot named',
    botName: 'Customer Support Bot',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    user: 'John Doe',
    action: 'edited',
    botName: 'Sales Assistant',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    user: 'John Doe',
    action: 'deleted a bot named',
    botName: 'Old Bot',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    user: 'John Doe',
    action: 'published a bot named',
    botName: 'Content Writer',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

export function createMockActivity(
  user: string,
  action: string,
  botName?: string
): Activity {
  return {
    id: `activity_${Date.now()}`,
    user,
    action,
    botName,
    timestamp: new Date().toISOString(),
  };
}
