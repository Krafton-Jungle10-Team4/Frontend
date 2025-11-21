import { cn } from '@/shared/components/utils';
import { useEffect, useRef, useState } from 'react';
import { Store, Workflow, BookOpen } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'marketplace' | 'studio' | 'knowledge' | 'library';
  onTabChange: (tab: NavigationTabsProps['activeTab']) => void;
  language: 'en' | 'ko';
}

const tabs = [
  { id: 'marketplace', label: { en: 'Marketplace', ko: '마켓플레이스' }, icon: Store },
  { id: 'studio', label: { en: 'Studio', ko: '스튜디오' }, icon: Workflow },
  { id: 'knowledge', label: { en: 'Knowledge', ko: '지식' }, icon: BookOpen },
] as const;

export function NavigationTabs({ activeTab, onTabChange, language }: NavigationTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeButton = tabRefs.current[activeIndex];

    if (activeButton) {
      const container = activeButton.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: activeButton.offsetWidth,
        });
      }
    }
  }, [activeTab]);

  return (
    <nav className="relative flex items-center gap-0">
      <div className="relative inline-flex items-center gap-8 bg-muted/50 rounded-lg p-1">
        <div
          className="absolute h-[calc(100%-8px)] transition-all duration-300 ease-out bg-white rounded-xl shadow-sm"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            top: '4px',
          }}
        />
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => onTabChange(tab.id as any)}
              className={cn(
                'relative z-10 flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:scale-105 active:scale-95'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="transition-colors duration-200">{tab.label[language]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
