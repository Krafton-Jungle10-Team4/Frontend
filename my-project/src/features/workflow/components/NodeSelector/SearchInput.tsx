/**
 * 노드 검색 입력 컴포넌트
 */

import { FC, memo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { SearchInputProps } from './types';

export const SearchInput: FC<SearchInputProps> = memo(
  ({ value, onChange, placeholder = '노드 검색...' }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // 마운트 시 자동 포커스
    useEffect(() => {
      // 약간의 지연 후 포커스 (팝업 애니메이션 고려)
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="relative p-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-9 pl-9 pr-9 rounded-lg',
            'bg-gray-100 dark:bg-gray-700',
            'border border-transparent',
            'focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800',
            'text-sm text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'outline-none transition-colors'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
