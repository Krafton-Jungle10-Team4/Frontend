import { X } from 'lucide-react';
import { Badge } from './badge';
import { cn } from './utils';

interface TagBadgeProps {
  tag: string;
  selected?: boolean;
  onClick?: (tag: string) => void;
  onRemove?: (tag: string) => void;
}

export function TagBadge({ tag, selected, onClick, onRemove }: TagBadgeProps) {
  return (
    <Badge
      variant={selected ? 'default' : 'outline'}
      className={cn(
        'cursor-pointer transition-colors',
        onClick && 'hover:bg-primary/10'
      )}
      onClick={() => onClick?.(tag)}
    >
      {tag}
      {onRemove && (
        <X
          className="ml-1 h-3 w-3 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
        />
      )}
    </Badge>
  );
}
