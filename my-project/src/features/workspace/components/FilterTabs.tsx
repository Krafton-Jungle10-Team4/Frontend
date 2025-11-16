/**
 * FilterTabs Component
 * 카테고리 또는 타입별 필터 탭
 */

import { cn } from '@/shared/components/utils';
import { useEffect, useRef, useState } from 'react';

export interface FilterTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: FilterTabsProps) {
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
  }, [activeTab, tabs]);

  return (
    <div
      className={cn(
        'relative flex items-center gap-0 overflow-x-auto pb-1',
        className
      )}
    >
      <div className="relative inline-flex items-center gap-0 bg-muted/50 rounded-lg p-1">
        <div
          className="absolute h-[calc(100%-8px)] bg-teal-500 rounded-md transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            transform: 'translateY(0)',
          }}
        />
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative z-10 flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95'
              )}
            >
              {Icon && <Icon className={cn('h-4 w-4 transition-colors duration-200')} />}
              <span className="transition-colors duration-200">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
