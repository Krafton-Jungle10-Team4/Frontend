import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { DocumentStatus } from '../../../types/document.types';
import { DOCUMENT_STATUS_CONFIG } from '../../../constants/documentConstants';

interface StatusFilterProps {
  value?: DocumentStatus;
  onChange: (value?: DocumentStatus) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(v) => onChange(v === 'all' ? undefined : (v as DocumentStatus))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="모든 상태" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">모든 상태</SelectItem>
        {Object.entries(DOCUMENT_STATUS_CONFIG).map(([status, config]) => (
          <SelectItem key={status} value={status}>
            <span className="flex items-center gap-2">
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
