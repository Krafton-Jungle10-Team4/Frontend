import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import type { SortOption } from '@/shared/types/workflow';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: Record<SortOption, string> = {
  recent: '최근 수정순',
  oldest: '오래된 순',
  'name-asc': '이름순 (오름차순)',
  'name-desc': '이름순 (내림차순)',
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1.5 h-10 px-3 text-sm font-medium text-gray-700 bg-white/80 border border-white/70 rounded-xl shadow-[0_10px_30px_rgba(55,53,195,0.08)] hover:border-[#3735c3] hover:text-[#3735c3] hover:shadow-[0_16px_40px_rgba(55,53,195,0.14)] focus-visible:ring-2 focus-visible:ring-[#3735c3] focus-visible:ring-offset-0 backdrop-blur"
        >
          <span>{SORT_OPTIONS[value]}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as SortOption)}>
          <DropdownMenuRadioItem value="recent">최근 수정순</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">오래된 순</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-asc">이름순 (오름차순)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-desc">이름순 (내림차순)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
