/**
 * ReadOnlyOverlay - 읽기 전용 표시 오버레이
 */
import { memo } from 'react';
import { Lock } from 'lucide-react';

export const ReadOnlyOverlay = memo(() => {
  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/90 border border-muted text-xs font-medium text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>읽기 전용</span>
      </div>
    </div>
  );
});

ReadOnlyOverlay.displayName = 'ReadOnlyOverlay';
