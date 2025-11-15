import { useState, useCallback, useEffect } from 'react';
import type { Topic, ModelConfig, VisionConfig } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { generateQuestionClassifierPortSchema } from '../utils/portSchemaGenerator';

interface UseQuestionClassifierProps {
  nodeId: string;
  classes: Topic[];
  model?: ModelConfig;
  visionConfig?: VisionConfig;
  onUpdate: (updates: any) => void;
}

/**
 * Question Classifier 노드 상태 관리 훅
 */
export function useQuestionClassifier({
  nodeId,
  classes: initialClasses,
  model: initialModel,
  visionConfig: initialVision,
  onUpdate,
}: UseQuestionClassifierProps) {
  const [classes, setClasses] = useState<Topic[]>(initialClasses || []);
  const [currentNodeId, setCurrentNodeId] = useState(nodeId);
  const { edges, updateNode, nodes } = useWorkflowStore();

  // 노드가 변경될 때만 상태 재설정 (상태 누수 방지)
  useEffect(() => {
    if (currentNodeId !== nodeId) {
      setClasses(initialClasses || []);
      setCurrentNodeId(nodeId);
    }
  }, [nodeId, currentNodeId, initialClasses]);

  // 포트 스키마 업데이트 함수
  const updatePorts = useCallback(
    (newClasses: Topic[], visionConfig?: VisionConfig) => {
      const newPorts = generateQuestionClassifierPortSchema(newClasses, visionConfig);
      updateNode(nodeId, { ports: newPorts });
    },
    [nodeId, updateNode]
  );

  // 변경사항을 부모에 전파
  const notifyUpdate = useCallback(
    (updates: any) => {
      onUpdate(updates);
    },
    [onUpdate]
  );

  // 클래스 목록 변경 (엣지 정리 포함)
  const handleClassesChange = useCallback(
    (newClasses: Topic[]) => {
      // 제거된 클래스 ID 찾기
      const oldClassIds = new Set(classes.map((c) => c.id));
      const newClassIds = new Set(newClasses.map((c) => c.id));
      const removedClassIds = Array.from(oldClassIds).filter((id) => !newClassIds.has(id));

      // 제거된 클래스와 연결된 엣지 찾기 및 삭제
      if (removedClassIds.length > 0) {
        const edgesToRemove = edges.filter((edge) => {
          if (edge.source !== nodeId) return false;
          const sourceHandle = edge.sourceHandle || '';
          return removedClassIds.some((classId) => sourceHandle.includes(`class_${classId}_branch`));
        });

        // 엣지 삭제
        edgesToRemove.forEach((edge) => {
          useWorkflowStore.getState().deleteEdge(edge.id);
        });
      }

      setClasses(newClasses);
      notifyUpdate({ classes: newClasses });

      // 포트 스키마 업데이트
      updatePorts(newClasses, initialVision);
    },
    [classes, edges, nodeId, notifyUpdate, initialVision, updatePorts]
  );

  // 모델 변경 (vision 모델 감지 포함)
  const handleModelChange = useCallback(
    (modelUpdate: Partial<ModelConfig>) => {
      const updatedModel = { ...initialModel, ...modelUpdate } as ModelConfig;

      // Vision 모델 감지 (gpt-4-vision, gemini-pro-vision 등)
      const isVisionModel = updatedModel.name?.toLowerCase().includes('vision');

      // Vision 모델인 경우 vision 설정 자동 활성화
      if (isVisionModel && !initialVision?.enabled) {
        notifyUpdate({
          model: updatedModel,
          vision: {
            enabled: true,
            variable_selector: [],
            detail: 'auto',
          },
        });
        updatePorts(classes, { enabled: true, variable_selector: [], detail: 'auto' });
      } else {
        notifyUpdate({ model: updatedModel });
      }
    },
    [initialModel, initialVision, notifyUpdate, classes, updatePorts]
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
      const newVision: VisionConfig = {
        enabled,
        variable_selector: enabled ? [] : undefined,
        detail: 'auto',
      };
      notifyUpdate({ vision: newVision });

      // 포트 스키마 업데이트 (files 입력 추가/제거)
      updatePorts(classes, newVision);
    },
    [notifyUpdate, classes, updatePorts]
  );

  // Vision 파일 변수 변경
  const handleVisionFileVarChange = useCallback(
    (fileVar: string[]) => {
      const newVision: VisionConfig = {
        ...initialVision,
        enabled: true,
        variable_selector: fileVar,
      };
      notifyUpdate({ vision: newVision });
    },
    [initialVision, notifyUpdate]
  );

  // Instruction 변경
  const handleInstructionChange = useCallback(
    (instruction: string) => {
      notifyUpdate({ instruction });
    },
    [notifyUpdate]
  );

  // Memory 변경
  const handleMemoryChange = useCallback(
    (memory: any) => {
      notifyUpdate({ memory });
    },
    [notifyUpdate]
  );

  return {
    classes,
    handleClassesChange,
    handleModelChange,
    handleQueryVarChange,
    handleVisionToggle,
    handleVisionFileVarChange,
    handleInstructionChange,
    handleMemoryChange,
  };
}
