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
  const validationErrors = useWorkflowStore((state) => state.validationErrors);
  const validationWarnings = useWorkflowStore(
    (state) => state.validationWarnings
  );
  const selectNode = useWorkflowStore((state) => state.selectNode);

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
                <li
                  key={`${error.type}-${error.node_id}-${i}`}
                  className="text-sm cursor-pointer hover:text-red-200"
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
                  key={`${warning.type}-${warning.node_id}-${i}`}
                  className="text-sm cursor-pointer hover:text-yellow-600"
                  onClick={() => warning.node_id && selectNode(warning.node_id)}
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
  );
};
