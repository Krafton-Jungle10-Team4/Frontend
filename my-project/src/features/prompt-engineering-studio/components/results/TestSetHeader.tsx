/**
 * Test Set Header Component
 * 테스트 세트 헤더 (이름, 생성일, 복원 버튼 등)
 */

import React from 'react';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { RotateCcw, Calendar, Settings } from 'lucide-react';
import type { TestSetDetailResponse } from '@/features/prompt-engineering-studio/types/api';

interface TestSetHeaderProps {
  testSet: TestSetDetailResponse;
  onRestore?: () => void;
}

export function TestSetHeader({ testSet, onRestore }: TestSetHeaderProps) {
  const { testSetName, createdAt, status, modelsTested } = testSet;

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">완료됨</Badge>;
      case 'processing':
        return <Badge variant="secondary">처리 중...</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl">{testSetName}</h1>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              <span>{formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="size-4" />
              <span>{modelsTested.length}개 모델 테스트</span>
            </div>
          </div>

          <div className="flex gap-2">
            {modelsTested.map((model) => (
              <Badge key={model} variant="outline">
                {model}
              </Badge>
            ))}
          </div>
        </div>

        {onRestore && status === 'completed' && (
          <Button variant="outline" onClick={onRestore}>
            <RotateCcw className="size-4 mr-2" />
            이 세트 복원하기
          </Button>
        )}
      </div>
    </Card>
  );
}
