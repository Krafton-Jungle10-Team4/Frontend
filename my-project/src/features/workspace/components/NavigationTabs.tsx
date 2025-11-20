import { cn } from '@/shared/components/utils';
import { useEffect, useRef, useState } from 'react';

interface NavigationTabsProps {
  activeTab: 'marketplace' | 'studio' | 'knowledge' | 'library';
  onTabChange: (tab: NavigationTabsProps['activeTab']) => void;
  language: 'en' | 'ko';
}

const tabs = [
  { id: 'marketplace', label: { en: 'Marketplace', ko: '마켓플레이스' } },
  { id: 'studio', label: { en: 'Studio', ko: '스튜디오' } },
  { id: 'knowledge', label: { en: 'Knowledge', ko: '지식' } },
] as const;

export function NavigationTabs({ activeTab, onTabChange, language }: NavigationTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeButton = tabRefs.current[activeIndex];

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <nav className="relative flex items-center gap-0">
      <div className="relative inline-flex items-center gap-0 bg-muted/50 rounded-lg p-1">
        <div
          className="absolute h-[calc(100%-8px)] rounded-md transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            transform: 'translateY(0)',
            backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
          }}
        />
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => onTabChange(tab.id as any)}
              className={cn(
                'relative z-10 flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95'
              )}
            >
              <span className="transition-colors duration-200">{tab.label[language]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
