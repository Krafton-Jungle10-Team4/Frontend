import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import type { Language, Activity } from '@/types';

interface RightSidebarProps {
  totalBots: number;
  activities: Activity[];
  maxBots?: number;
  userName?: string;
  language: Language;
}

export function RightSidebar({ totalBots, activities, maxBots = 5, userName = 'User', language }: RightSidebarProps) {
  const usagePercentage = Math.round((totalBots / maxBots) * 100);
  const userInitial = userName.charAt(0).toUpperCase();

  const translations = {
    en: {
      bots: 'Bots',
      manage: 'Manage',
      used: 'used',
      of: 'of',
      recentActivity: 'Recent Activity',
      viewAll: 'View All'
    },
    ko: {
      bots: '챗봇',
      manage: '관리',
      used: '사용 중',
      of: '/',
      recentActivity: '최근 활동',
      viewAll: '모두 보기'
    }
  };

  const t = translations[language];

  return (
    <div className="w-80 h-full border-l border-gray-200 bg-gray-50 p-6 overflow-auto">
      {/* Bots Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-gray-600" />
            <span className="text-sm text-gray-900">{t.bots}</span>
          </div>
          <button className="text-sm text-gray-600 hover:text-gray-900">{t.manage}</button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{totalBots} {t.of} {maxBots} {t.used}</span>
            <span className="text-gray-900">{usagePercentage}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-900">{t.recentActivity}</span>
          <button className="text-sm text-gray-600 hover:text-gray-900">{t.viewAll}</button>
        </div>
        <div className="space-y-4">
          {activities.slice(0, 3).map((activity) => (
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
      </div>
    </div>
  );
}
