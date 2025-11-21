/**
 * BotFilterSidebar Component
 * 봇 태그 필터 사이드바
 */

import { Tag } from 'lucide-react';
import { cn } from '@/shared/components/utils';
import type { Language } from '@/shared/types';

interface BotFilterSidebarProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  language: Language;
}

export function BotFilterSidebar({
  allTags,
  selectedTags,
  onTagToggle,
  language,
}: BotFilterSidebarProps) {
  const translations = {
    en: {
      tagFilter: 'Tag Filter',
      noTags: 'No tags available',
    },
    ko: {
      tagFilter: '태그 필터',
      noTags: '태그가 없습니다',
    },
  };

  const t = translations[language];

  return (
    <aside className="w-[280px] h-full bg-white border-r border-gray-200 p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-700">{t.tagFilter}</h3>
        </div>

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all border',
                  selectedTags.includes(tag)
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">{t.noTags}</p>
        )}
      </div>
    </aside>
  );
}
