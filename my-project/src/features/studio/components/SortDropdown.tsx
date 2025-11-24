import { Clock } from 'lucide-react';
import { cn } from '@/shared/components/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import type { SortOption } from '@/shared/types/workflow';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const isRecent = value === 'recent';

  const handleToggle = () => {
    onChange(isRecent ? 'oldest' : 'recent');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              isRecent
                ? 'text-gray-700'
                : 'text-gray-400 hover:text-gray-500'
            )}
          >
            <Clock className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isRecent ? '최근 수정순' : '오래된 순'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
