/**
 * FilterTabs Component
 * 카테고리 또는 타입별 필터 탭
 */

import { cn } from '@/shared/components/utils';

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
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border pb-1',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
