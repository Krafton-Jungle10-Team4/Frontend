
/**
 * WinnerCard Component
 * 최고 성능 조합을 보여주는 카드
 */
import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { Award } from 'lucide-react';
import { WinnerCardProps } from '@features/prompt-engineering-studio/types/results';

export function WinnerCard({ winner }: WinnerCardProps) {
  if (!winner) return null;

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="text-lg text-white mb-1">최고 성능 조합</h3>
            <p className="text-sm text-white/70">{winner.name}</p>
          </div>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          Top Pick
        </Badge>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">종합 점수:</span>
          <span className="text-white font-semibold">{winner.overallScore}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">응답 시간:</span>
          <span className="text-white font-semibold">{winner.responseTime}초</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">예상 비용:</span>
          <span className="text-white font-semibold">{winner.cost}</span>
        </div>
      </div>
    </Card>
  );
}
