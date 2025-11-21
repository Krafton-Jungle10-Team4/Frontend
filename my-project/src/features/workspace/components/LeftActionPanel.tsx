/**
 * LeftActionPanel Component
 * 스튜디오/지식 탭 왼쪽 고정 액션 패널
 */

import { Button } from '@/shared/components/button';
import { RiAddLine, RiFileTextLine, RiLinksLine } from '@remixicon/react';
import { cn } from '@/shared/components/utils';

interface LeftActionPanelProps {
  variant: 'studio' | 'knowledge';
  onCreateBlank?: () => void;
  onCreateFromTemplate?: () => void;
  onCreateKnowledge?: () => void;
  onImportFromFile?: () => void;
  onConnectExternal?: () => void;
  className?: string;
}

export function LeftActionPanel({
  variant,
  onCreateBlank,
  onCreateFromTemplate,
  onCreateKnowledge,
  onImportFromFile,
  onConnectExternal,
  className,
}: LeftActionPanelProps) {
  if (variant === 'studio') {
    return (
      <div
        className={cn(
          'hidden w-64 flex-shrink-0 flex-col gap-4 rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md md:flex',
          className
        )}
      >
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <h2 className="text-lg font-semibold">서비스 만들기</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            새로운 서비스를 만들어보세요
          </p>
        </div>

        <Button
          onClick={onCreateBlank}
          variant="outline"
          className="w-full justify-start gap-2 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <RiAddLine className="h-4 w-4" />
          빈 상태로 시작
        </Button>

        <Button
          onClick={onCreateFromTemplate}
          variant="outline"
          className="w-full justify-start gap-2 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <RiFileTextLine className="h-4 w-4" />
          템플릿에서 시작
        </Button>
      </div>
    );
  }

  if (variant === 'knowledge') {
    return (
      <div
        className={cn(
          'hidden w-64 flex-shrink-0 flex-col gap-4 rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md md:flex',
          className
        )}
      >
        <div className="mb-2">
          <h2 className="text-lg font-semibold">지식 생성</h2>
          <p className="text-sm text-muted-foreground">
            지식 베이스를 구축하세요
          </p>
        </div>

        <Button
          onClick={onCreateKnowledge}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <RiAddLine className="h-4 w-4" />
          지식 생성
        </Button>

        <Button
          onClick={onImportFromFile}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <RiFileTextLine className="h-4 w-4" />
          파일에서 가져오기
        </Button>

        <Button
          onClick={onConnectExternal}
          variant="outline"
          className="w-full justify-start gap-2"
          disabled
        >
          <RiLinksLine className="h-4 w-4" />
          외부 자료 연결
        </Button>
      </div>
    );
  }

  return null;
}
