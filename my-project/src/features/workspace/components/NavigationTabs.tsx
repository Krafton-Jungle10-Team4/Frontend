import { Compass, LayoutGrid, BookOpen, Wrench } from 'lucide-react';
import { cn } from '@/shared/components/utils';

interface NavigationTabsProps {
  activeTab: 'explore' | 'studio' | 'knowledge' | 'tools';
  onTabChange: (tab: NavigationTabsProps['activeTab']) => void;
  language: 'en' | 'ko';
}

const tabs = [
  { id: 'explore', icon: Compass, label: { en: 'Explore', ko: '탐색' } },
  { id: 'studio', icon: LayoutGrid, label: { en: 'Studio', ko: '스튜디오' } },
  { id: 'knowledge', icon: BookOpen, label: { en: 'Knowledge', ko: '지식' } },
  { id: 'tools', icon: Wrench, label: { en: 'Tools', ko: '도구' } },
] as const;

export function NavigationTabs({
  activeTab,
  onTabChange,
  language,
}: NavigationTabsProps) {
  const brandAccent = '#1CC8A0';

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-transparent">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all',
              isActive
                ? 'text-white shadow'
                : 'text-[#6b7280] hover:text-[#1e2a5a]'
            )}
            aria-current={isActive ? 'page' : undefined}
            style={
              isActive
                ? { backgroundColor: brandAccent }
                : { backgroundColor: 'transparent', border: '1px solid transparent' }
            }
          >
            <Icon
              className={cn(
                'h-4 w-4 transition-colors',
                isActive ? 'text-white' : 'text-[#9ca3af]'
              )}
            />
            <span className="font-medium">{tab.label[language]}</span>
          </button>
        );
      })}
    </div>
  );
}
