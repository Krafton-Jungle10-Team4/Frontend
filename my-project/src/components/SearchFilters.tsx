import { Search, Grid3x3, List } from 'lucide-react';
import { Input } from './ui/input';
import type { Language } from '../contexts/AppContext';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  language: Language;
}

export function SearchFilters({ searchQuery, onSearchChange, viewMode, onViewModeChange, language }: SearchFiltersProps) {
  const translations = {
    en: {
      search: 'Search'
    },
    ko: {
      search: '검색'
    }
  };

  const t = translations[language];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-sm h-9"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button 
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 sm:p-2 rounded ${
              viewMode === 'list' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 sm:p-2 rounded ${
              viewMode === 'grid' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid3x3 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
