import { useState, useCallback, useEffect } from 'react';
import type { Topic, ModelConfig } from '@/shared/types/workflow.types';

interface UseQuestionClassifierProps {
  nodeId: string;
  classes: Topic[];
  model?: ModelConfig;
  onUpdate: (updates: any) => void;
}

/**
 * Question Classifier 노드 상태 관리 훅
 */
export function useQuestionClassifier({
  nodeId,
  classes: initialClasses,
  model: initialModel,
  onUpdate,
}: UseQuestionClassifierProps) {
  const [classes, setClasses] = useState<Topic[]>(initialClasses || []);
  const [currentNodeId, setCurrentNodeId] = useState(nodeId);

  // 노드가 변경될 때만 상태 재설정 (상태 누수 방지)
  useEffect(() => {
    if (currentNodeId !== nodeId) {
      setClasses(initialClasses || []);
      setCurrentNodeId(nodeId);
    }
  }, [nodeId, currentNodeId, initialClasses]);

  // 변경사항을 부모에 전파
  const notifyUpdate = useCallback(
    (updates: any) => {
      onUpdate(updates);
    },
    [onUpdate]
  );

  // 클래스 목록 변경
  const handleClassesChange = useCallback(
    (newClasses: Topic[]) => {
      setClasses(newClasses);
      notifyUpdate({ classes: newClasses });
    },
    [notifyUpdate]
  );

  // 모델 변경
  const handleModelChange = useCallback(
    (modelUpdate: Partial<ModelConfig>) => {
      const updatedModel = { ...initialModel, ...modelUpdate } as ModelConfig;
      notifyUpdate({ model: updatedModel });
    },
    [initialModel, notifyUpdate]
  );

  // 입력 변수 변경
  const handleQueryVarChange = useCallback(
    (newVar: string[]) => {
      notifyUpdate({ query_variable_selector: newVar });
    },
    [notifyUpdate]
  );

  // Vision 토글
  const handleVisionToggle = useCallback(
    (enabled: boolean) => {
      notifyUpdate({
        vision: {
          enabled,
          variable_selector: enabled ? [] : undefined,
          detail: 'auto',
        },
      });
    },
    [notifyUpdate]
  );

  // Instruction 변경
  const handleInstructionChange = useCallback(
    (instruction: string) => {
      notifyUpdate({ instruction });
    },
    [notifyUpdate]
  );

  return {
    classes,
    handleClassesChange,
    handleModelChange,
    handleQueryVarChange,
    handleVisionToggle,
    handleInstructionChange,
  };
}
