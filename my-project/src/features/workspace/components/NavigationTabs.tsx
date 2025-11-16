import { useRef, useEffect, useState } from 'react';
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
  const brandAccent = '#14b8a6';
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const containerElement = containerRef.current;

    if (activeTabElement && containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
      });
    }
  }, [activeTab]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2 px-3 py-1 bg-transparent">
      <div
        className="absolute rounded-full shadow transition-all duration-300 ease-out"
        style={{
          backgroundColor: brandAccent,
          width: `${indicatorStyle.width}px`,
          height: '32px',
          left: `${indicatorStyle.left}px`,
          top: '4px',
          pointerEvents: 'none',
        }}
      />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            onClick={() => onTabChange(tab.id as any)}
            className={cn(
              'relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                ? 'text-white hover:scale-105 active:scale-95'
                : 'text-[#374151] hover:text-[#1e2a5a] hover:bg-white/50 hover:shadow-sm hover:scale-105 active:scale-95'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isActive ? 'text-white' : 'text-[#4b5563]'
              )}
            />
            <span className="font-medium transition-colors duration-200">{tab.label[language]}</span>
          </button>
        );
      })}
    </div>
  );
}
