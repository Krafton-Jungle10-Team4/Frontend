/**
 * PromptSetPagination Component
 * 프롬프트 세트 간 전환을 위한 페이지네이션
 */

import { Button } from '@/shared/components/button';
import { PromptSetPaginationProps } from '@/features/prompt-engineering-studio/types/prompt';

export function PromptSetPagination({
  totalSets,
  activeIndex,
  onSetChange,
}: PromptSetPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-sm text-white/60 mr-2">테스트 세트:</span>
      {Array.from({ length: totalSets }, (_, index) => (
        <Button
          key={index}
          size="sm"
          variant={activeIndex === index ? 'default' : 'outline'}
          onClick={() => onSetChange(index)}
          className={
            activeIndex === index
              ? 'bg-purple-500 text-white hover:bg-purple-600 min-w-[40px]'
              : 'border-white/10 !text-white hover:!text-white hover:bg-white/5 min-w-[40px]'
          }
        >
          {index + 1}
        </Button>
      ))}
    </div>
  );
}
