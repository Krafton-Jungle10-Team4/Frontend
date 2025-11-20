import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface TagProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  label,
  selected = false,
  onClick,
  onRemove,
  className,
  disabled,
  ...props
}) => {
  const handleRemove = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 rounded-sharp border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-primary/60 disabled:opacity-60',
        selected
          ? 'bg-studio-button text-studio-tag-selectedText border-transparent shadow-studio-card'
          : 'bg-studio-tag-bg text-studio-tag-text border-studio-sidebar-border hover:bg-studio-tag-bg/80',
        className
      )}
      {...props}
    >
      <span className="truncate" title={label}>
        {label}
      </span>
      {onRemove && (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label} 태그 제거`}
          onClick={handleRemove}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRemove(event);
            }
          }}
          className={cn(
            'ml-1 inline-flex items-center justify-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
            selected ? 'text-white hover:bg-white/20' : 'text-studio-tag-text hover:bg-black/5'
          )}
        >
          <X size={12} aria-hidden="true" />
        </span>
      )}
    </button>
  );
};
