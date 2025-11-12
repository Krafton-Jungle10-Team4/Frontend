/**
 * Model Result Card Component
 * 개별 모델 결과 카드
 */

import React from 'react';
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Trophy, Clock, DollarSign, Star } from 'lucide-react';
import type { ModelResult } from '@/features/prompt-engineering-studio/types/api';

interface ModelResultCardProps {
  modelResult: ModelResult;
  isWinner?: boolean;
  onSelectWinner?: () => void;
  showWinnerButton?: boolean;
}

export function ModelResultCard({
  modelResult,
  isWinner = false,
  onSelectWinner,
  showWinnerButton = true,
}: ModelResultCardProps) {
  const { modelName, answer, responseTime, cost, quality } = modelResult;

  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 4.5) return 'default';
    if (score >= 4.0) return 'secondary';
    return 'outline';
  };

  return (
    <Card className={`p-6 ${isWinner ? 'border-yellow-400 border-2 shadow-lg' : ''}`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{modelName}</h3>
          {isWinner && (
            <Badge variant="default" className="bg-yellow-500">
              <Trophy className="size-3 mr-1" />
              Winner
            </Badge>
          )}
        </div>
        {showWinnerButton && !isWinner && (
          <Button variant="outline" size="sm" onClick={onSelectWinner}>
            이 조합 사용
          </Button>
        )}
      </div>

      {/* 메트릭스 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">응답 시간</p>
            <p className="font-semibold">{responseTime.toFixed(2)}s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">비용</p>
            <p className="font-semibold">${cost.toFixed(4)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="size-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">품질 점수</p>
            <p className={`font-semibold ${getScoreColor(quality.totalScore)}`}>
              {quality.totalScore.toFixed(1)}/5.0
            </p>
          </div>
        </div>
      </div>

      {/* 품질 세부 지표 */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">품질 세부 평가</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getScoreBadgeVariant(quality.accuracy)}>
            정확성: {quality.accuracy.toFixed(1)}
          </Badge>
          <Badge variant={getScoreBadgeVariant(quality.relevance)}>
            관련성: {quality.relevance.toFixed(1)}
          </Badge>
          <Badge variant={getScoreBadgeVariant(quality.completeness)}>
            완전성: {quality.completeness.toFixed(1)}
          </Badge>
          <Badge variant={getScoreBadgeVariant(quality.consistency)}>
            일관성: {quality.consistency.toFixed(1)}
          </Badge>
          <Badge variant={getScoreBadgeVariant(quality.toneAndStyle)}>
            톤&스타일: {quality.toneAndStyle.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* 평가 근거 */}
      {quality.reasoning && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-1">평가 근거</p>
          <p className="text-sm text-gray-600">{quality.reasoning}</p>
        </div>
      )}

      {/* 답변 내용 */}
      <div>
        <p className="text-sm font-medium mb-2">모델 답변</p>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{answer}</p>
        </div>
      </div>
    </Card>
  );
}
