import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/components/utils';

interface NavigationTabsProps {
  activeTab: 'explore' | 'studio' | 'knowledge' | 'library';
  onTabChange: (tab: NavigationTabsProps['activeTab']) => void;
  language: 'en' | 'ko';
}

const tabs = [
  { id: 'explore', label: { en: 'Explore', ko: '탐색' } },
  { id: 'studio', label: { en: 'Studio', ko: '스튜디오' } },
  { id: 'knowledge', label: { en: 'Knowledge', ko: '지식' } },
  { id: 'library', label: { en: 'Library', ko: '라이브러리' } },
] as const;

export function NavigationTabs({ activeTab, onTabChange, language }: NavigationTabsProps) {
  const location = useLocation();
  const isStudioPage = location.pathname.includes('/workspace/studio');

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-all rounded-studio',
              isStudioPage
                ? isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                : isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label[language]}
          </button>
        );
      })}
    </nav>
  );
}
