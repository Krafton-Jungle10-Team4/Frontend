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
      className="rounded-studio border border-studio-card-border bg-studio-card-bg px-3 py-2 text-sm text-studio-text-primary shadow-sm transition-colors focus:border-studio-primary focus:outline-none focus:ring-2 focus:ring-studio-primary/20"
    >
      <option value="recent">최근 수정순</option>
      <option value="oldest">오래된 순</option>
      <option value="name-asc">이름순 (오름차순)</option>
      <option value="name-desc">이름순 (내림차순)</option>
    </select>
  );
}
