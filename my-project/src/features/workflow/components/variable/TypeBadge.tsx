import { Badge } from '@shared/components/badge';
import { PortType } from '@shared/types/workflow/port.types';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';

interface TypeBadgeProps {
  type: PortType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const meta = PORT_TYPE_META[type];

  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-mono shrink-0', meta.color, className)}
    >
      {meta.label}
    </Badge>
  );
}
