import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Trash2, PlayCircle } from 'lucide-react';
import { useDemoAppStore } from '../stores/demoAppStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function ExecutionHistory() {
  const { executionHistory, clearHistory, loadHistoryItem } = useDemoAppStore();

  if (executionHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        실행 히스토리가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          전체 삭제
        </Button>
      </div>

      <div className="space-y-2">
        {executionHistory.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    record.status === 'success' ? 'default' : 'destructive'
                  }
                >
                  {record.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(record.timestamp), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
                {record.duration && (
                  <span className="text-sm text-muted-foreground">
                    • {record.duration}ms
                  </span>
                )}
              </div>
              <p className="text-sm truncate">
                {JSON.stringify(record.request.inputs)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadHistoryItem(record.id)}
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

