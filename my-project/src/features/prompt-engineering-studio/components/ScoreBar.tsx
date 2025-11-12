import { cn } from '@shared/utils/cn';

interface ScoreBarProps {
  score: number;
}

export function ScoreBar({ score }: ScoreBarProps) {
  const percentage = score;
  
  const barColor =
    percentage > 90
      ? 'bg-cyan-400'
      : percentage > 80
      ? 'bg-green-400'
      : percentage > 70
      ? 'bg-yellow-400'
      : 'bg-orange-400';

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div
        className={cn('h-2.5 rounded-full transition-all duration-500', barColor)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
