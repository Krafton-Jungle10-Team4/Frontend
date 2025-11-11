import { ResponseItem } from '../types/testSet';
import { Button } from '@shared/components/button';

interface ResponseItemDisplayProps {
  item: ResponseItem;
}

export function ResponseItemDisplay({ item }: ResponseItemDisplayProps) {
  return (
    <div className="border-t py-4">
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-sm">{item.question}</p>
        <span className="text-sm font-bold text-primary">{item.score}</span>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.answer}</p>
      <div className="text-right mt-2">
        <Button variant="link" size="sm">View Details</Button>
      </div>
    </div>
  );
}
