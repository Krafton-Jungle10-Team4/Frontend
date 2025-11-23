import { Search, Grid, List } from 'lucide-react';
import { Input } from '@/shared/components/input';
import { Button } from '@/shared/components/button';

type ViewMode = 'grid' | 'list';
type Language = 'en' | 'ko';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  language?: Language;
}

const translations = {
  ko: {
    searchPlaceholder: '서비스 검색...',
    gridView: '격자 보기',
    listView: '목록 보기',
  },
};

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  language: _language = 'ko',
}: SearchFiltersProps) => {
  const t = translations.ko;

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b">
      <div className="relative flex-1">
        <div className="relative flex items-center">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('grid')}
          title={t.gridView}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('list')}
          title={t.listView}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
