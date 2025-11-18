import React from 'react';
import { Button } from '@/shared/components/button';
import { X } from 'lucide-react';
import { useAsyncDocumentStore } from '../../../stores/documentStore.async';
import { useFilters } from '../../../stores/selectors';
import { StatusFilter } from './StatusFilter';
import { SearchInput } from './SearchInput';
import { BotFilter } from './BotFilter';
import { useBotStore, selectBots } from '@/features/bot/stores/botStore';

export const DocumentFilters: React.FC = () => {
  const filters = useFilters();
  const { setFilters, resetFilters } = useAsyncDocumentStore();
  const bots = useBotStore(selectBots);

  const [searchQuery, setSearchQuery] = React.useState(filters.searchQuery || '');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchQuery: searchQuery || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setFilters]);

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.botId !== undefined ||
    (filters.searchQuery && filters.searchQuery.length > 0);

  // Get bot name for active filter display
  const getSelectedBotName = (botId?: string) => {
    if (!botId) return null;
    const bot = bots.find((b) => b.id === botId);
    return bot?.name || botId;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />

        <StatusFilter
          value={filters.status}
          onChange={(status) => setFilters({ status })}
        />

        <BotFilter
          value={filters.botId}
          onChange={(botId) => setFilters({ botId })}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetFilters();
              setSearchQuery('');
            }}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            필터 초기화
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>활성 필터:</span>
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
              상태: {filters.status}
            </span>
          )}
          {filters.botId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
              봇: {getSelectedBotName(filters.botId)}
            </span>
          )}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary">
              검색: "{filters.searchQuery}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};
