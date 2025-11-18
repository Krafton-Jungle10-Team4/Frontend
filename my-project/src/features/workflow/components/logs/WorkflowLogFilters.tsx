import { memo, useState, useCallback } from 'react';
import { Calendar, Search, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover';
import { Calendar as CalendarComponent } from '@/shared/components/calendar';
import { Badge } from '@/shared/components/badge';
import type { WorkflowLogFilters as WorkflowLogFiltersType } from '../../../types/log.types';
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface WorkflowLogFiltersProps {
  filters: WorkflowLogFiltersType;
  onChange: (filters: WorkflowLogFiltersType) => void;
  onReset: () => void;
  isDisabled?: boolean;
}

export const WorkflowLogFilters = memo<WorkflowLogFiltersProps>(
  ({ filters, onChange, onReset, isDisabled = false }) => {
    const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

    const handleStatusChange = useCallback(
      (status: string) => {
        onChange({
          ...filters,
          status: status === 'all' ? 'all' : (status as WorkflowLogFiltersType['status']),
        });
      },
      [filters, onChange]
    );

    const handleStartDateChange = useCallback(
      (date: Date | undefined) => {
        onChange({
          ...filters,
          startDate: date,
        });
      },
      [filters, onChange]
    );

    const handleEndDateChange = useCallback(
      (date: Date | undefined) => {
        onChange({
          ...filters,
          endDate: date,
        });
      },
      [filters, onChange]
    );

    const handleSearchChange = useCallback(
      (value: string) => {
        setSearchQuery(value);
        onChange({
          ...filters,
          searchQuery: value || undefined,
        });
      },
      [filters, onChange]
    );

    const hasActiveFilters =
      filters.status !== 'all' ||
      filters.startDate ||
      filters.endDate ||
      (filters.searchQuery && filters.searchQuery.length > 0);

    return (
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">상태</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="running">실행 중</SelectItem>
                <SelectItem value="succeeded">성공</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">시작일</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                  disabled={isDisabled}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    formatDate(filters.startDate)
                  ) : (
                    <span className="text-muted-foreground">선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">종료일</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                  disabled={isDisabled}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    formatDate(filters.endDate)
                  ) : (
                    <span className="text-muted-foreground">선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Filter */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="검색어 입력..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isDisabled}
                className="pl-9"
              />
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isDisabled}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              초기화
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">활성 필터:</span>
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                상태: {filters.status === 'running' ? '실행 중' : filters.status === 'succeeded' ? '성공' : '실패'}
                <button
                  onClick={() => handleStatusChange('all')}
                  className="ml-1 rounded-full hover:bg-muted"
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="gap-1">
                시작일: {formatDate(filters.startDate)}
                <button
                  onClick={() => handleStartDateChange(undefined)}
                  className="ml-1 rounded-full hover:bg-muted"
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="gap-1">
                종료일: {formatDate(filters.endDate)}
                <button
                  onClick={() => handleEndDateChange(undefined)}
                  className="ml-1 rounded-full hover:bg-muted"
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary" className="gap-1">
                검색: {filters.searchQuery}
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 rounded-full hover:bg-muted"
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }
);

WorkflowLogFilters.displayName = 'WorkflowLogFilters';

