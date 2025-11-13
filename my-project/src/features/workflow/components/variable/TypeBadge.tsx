import { Badge } from '@shared/components/badge';
import { PortType } from '@shared/types/workflow/port.types';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';
import {
  RiTextLine,
  RiHashtag,
  RiToggleLine,
  RiListCheck2,
  RiBracesFill,
  RiFileLine,
  RiAsterisk,
} from '@remixicon/react';

interface TypeBadgeProps {
  type: PortType;
  className?: string;
}

// Icon mapping from string names to components
const ICON_MAP = {
  RiTextIcon: RiTextLine,
  RiHashtagIcon: RiHashtag,
  RiToggleIcon: RiToggleLine,
  RiListIcon: RiListCheck2,
  RiBracesIcon: RiBracesFill,
  RiFileIcon: RiFileLine,
  RiAsteriskIcon: RiAsterisk,
} as const;

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const meta = PORT_TYPE_META[type];
  const IconComponent = ICON_MAP[meta.icon as keyof typeof ICON_MAP];

  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-mono shrink-0', meta.color, className)}
    >
      {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {meta.label}
    </Badge>
  );
}
