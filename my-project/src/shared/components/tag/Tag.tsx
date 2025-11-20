import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  label,
  selected,
  onClick,
  onRemove
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-sharp text-sm transition-colors',
        'border border-gray-300',
        selected
          ? 'bg-primary-gradient text-white border-transparent'
          : 'bg-white text-gray-700 hover:bg-gray-50',
        onClick && 'cursor-pointer'
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-gray-900"
        >
          <X size={12} />
        </button>
      )}
    </button>
  );
};
