import { useMemo, useState } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/alert';
import { Button } from '@shared/components/button';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface ValidationPanelProps {
  className?: string;
}

/**
 * 검증 결과 패널
 *
 * 버튼은 툴바와 동일한 높이/스타일을 사용하고,
 * 클릭 시 상세 목록을 펼쳐 오류를 명시합니다.
 */
export const ValidationPanel = ({ className = '' }: ValidationPanelProps) => {
  const validationErrors = useWorkflowStore((state) => state.validationErrors);
  const validationWarnings = useWorkflowStore(
    (state) => state.validationWarnings
  );
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const [isOpen, setIsOpen] = useState(false);

  const totalIssues = validationErrors.length + validationWarnings.length;
  const buttonLabel = useMemo(() => {
    if (validationErrors.length) {
      return `검증 오류 ${validationErrors.length}`;
    }
    return `경고 ${validationWarnings.length}`;
  }, [validationErrors.length, validationWarnings.length]);

  if (totalIssues === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 whitespace-nowrap"
      >
        <AlertCircle className="h-4 w-4 text-red-500" />
        {buttonLabel}
        <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
          {totalIssues}
        </span>
        {isOpen ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[380px] max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
          {/* 에러 */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>검증 오류</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((error, i) => (
                    <li
                      key={`${error.type}-${error.node_id ?? 'global'}-${i}`}
                      className="cursor-pointer text-sm leading-5 hover:text-red-100"
                      onClick={() => error.node_id && selectNode(error.node_id)}
                    >
                      {error.node_id ? `[${error.node_id}] ` : null}
                      {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 경고 */}
          {validationWarnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>경고</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {validationWarnings.map((warning, i) => (
                    <li
                      key={`${warning.type}-${warning.node_id ?? 'global'}-${i}`}
                      className="cursor-pointer text-sm leading-5 hover:text-yellow-600"
                      onClick={() =>
                        warning.node_id && selectNode(warning.node_id)
                      }
                    >
                      {warning.node_id ? `[${warning.node_id}] ` : null}
                      {warning.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
