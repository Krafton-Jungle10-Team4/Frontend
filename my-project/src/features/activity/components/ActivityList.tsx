/**
 * ActivityList Component
 * 활동 내역 리스트
 */

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import type { Activity } from '../types/activity.types';

interface ActivityListProps {
  activities: Activity[];
  userName?: string;
  language?: 'en' | 'ko';
}

export function ActivityList({ activities, userName = 'User', language = 'ko' }: ActivityListProps) {
  const userInitial = userName.charAt(0).toUpperCase();

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        {language === 'ko' ? '최근 활동이 없습니다' : 'No recent activity'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-teal-500 text-white text-xs">{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600">
              {activity.message || `${activity.type} - ${activity.botName || ''}`}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(activity.timestamp).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
