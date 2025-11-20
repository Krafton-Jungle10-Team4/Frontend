import type { SortOption } from '@/shared/types/workflow';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as SortOption)}
      className="rounded-studio border border-studio-card-border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-studio-primary focus:outline-none focus:ring-2 focus:ring-studio-primary/20"
    >
      <option value="recent">최근 수정순</option>
      <option value="name">이름순</option>
      <option value="status">상태순</option>
    </select>
  );
}
