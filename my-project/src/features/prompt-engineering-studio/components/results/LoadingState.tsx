/**
 * Loading State Component
 * 테스트 결과 로딩 상태
 */

import React from 'react';
import { Card } from '@/shared/components/card';
import { Progress } from '@/shared/components/progress';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = '테스트 결과를 불러오는 중입니다...',
}: LoadingStateProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          return 90; // 90%에서 멈춤 (완료 전까지)
        }
        return prevProgress + 10;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 max-w-md w-full bg-black/20 backdrop-blur-md border border-white/20 text-white">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="size-12 text-teal-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">테스트 결과 로딩 중</h3>
          <p className="text-sm text-gray-300 mb-4">{message}</p>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-gray-400 mt-2">
            테스트 결과를 불러오고 있습니다. 잠시만 기다려주세요.
          </p>
        </div>
      </Card>
    </div>
  );
}
