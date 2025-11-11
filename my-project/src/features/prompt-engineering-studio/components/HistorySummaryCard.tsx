import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/card';
import { Cpu, User } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  promptContent: string;
  model: string;
  avgScore?: number;
  isWinner?: boolean;
}

export function HistorySummaryCard({
  title,
  promptContent,
  model,
  avgScore,
  isWinner = false,
}: SummaryCardProps) {
  const Icon = isWinner ? Cpu : User;
  const iconColor = isWinner ? 'text-teal-400' : 'text-blue-400';

  return (
    <Card className="h-full bg-gray-900/60 border border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-gray-200">
          <Icon className={`mr-2 h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm text-gray-400">Prompt</h4>
          <p className="text-sm text-gray-300 break-words whitespace-pre-wrap">
            {promptContent}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-400">Model</h4>
          <p className="text-sm text-gray-300">{model}</p>
        </div>
        {avgScore !== undefined && (
          <div>
            <h4 className="font-semibold text-sm text-gray-400">
              Average Score
            </h4>
            <p className="text-xl font-bold text-teal-300">
              {avgScore.toFixed(1)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
