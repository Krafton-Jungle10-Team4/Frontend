/**
 * OutputVars
 *
 * 출력 변수 섹션을 감싸는 접기/펼치기 가능한 래퍼
 * Dify의 Variable System을 참고하여 구현
 */

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/components/collapsible';
import { Label } from '@shared/components/label';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { cn } from '@shared/utils/cn';

interface OutputVarsProps {
  /** 섹션 제목 */
  title?: string;

  /** VarItem 컴포넌트들 */
  children: React.ReactNode;

  /** 우측 작업 버튼 (옵션) */
  operations?: React.ReactNode;

  /** 기본 접힌 상태 */
  defaultCollapsed?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;
}

export const OutputVars = ({
  title = '출력 변수',
  children,
  operations,
  defaultCollapsed = false,
  className,
}: OutputVarsProps) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors">
            {isOpen ? (
              <RiArrowDownSLine size={16} className="text-gray-500" />
            ) : (
              <RiArrowRightSLine size={16} className="text-gray-500" />
            )}
            <Label className="font-semibold cursor-pointer">{title}</Label>
          </button>
        </CollapsibleTrigger>

        {operations && <div className="flex items-center gap-2">{operations}</div>}
      </div>

      <CollapsibleContent className="space-y-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
