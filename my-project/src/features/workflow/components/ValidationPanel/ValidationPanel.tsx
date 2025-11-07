import { useWorkflowStore } from '../../stores/workflowStore';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * 검증 결과 패널
 *
 * 워크플로우 검증 결과를 화면 하단에 표시합니다.
 * 에러와 경고를 구분하여 표시하며, 검증 문제가 없을 때는 숨겨집니다.
 */
export const ValidationPanel = () => {
  const { validationErrors, validationWarnings } = useWorkflowStore();

  if (validationErrors.length === 0 && validationWarnings.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2 max-w-md">
      {/* 에러 */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>검증 오류</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-sm">
                  {error}
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
                <li key={i} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
