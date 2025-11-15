import { Skeleton } from '@shared/components/skeleton';

export function ChatSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4 space-y-4">
        <div className="flex gap-3 justify-start">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex flex-col max-w-[70%] space-y-2">
            <Skeleton className="h-16 w-64 rounded-lg" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <div className="flex flex-col max-w-[70%] space-y-2 items-end">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>
      </div>

      <div className="border-t bg-background px-4 sm:px-6 py-4 flex gap-3">
        <Skeleton className="flex-1 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
}
