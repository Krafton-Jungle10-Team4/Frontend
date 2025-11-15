import type { Topic, VisionConfig } from '@/shared/types/workflow.types';
import type { NodePortSchema, PortDefinition } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';

const DEFAULT_CLASS_NAMES = [
  '',
  '',
];

export const createDefaultQuestionClassifierClasses = (): Topic[] =>
  DEFAULT_CLASS_NAMES.map((name, index) => ({
    id: `class_${index + 1}`,
    name,
  }));

/**
 * Question Classifier 노드의 동적 포트 스키마 생성
 *
 * 입력:
 * - query: 분류할 텍스트 (필수)
 * - files: Vision 모드일 때 이미지 파일들 (선택)
 *
 * 출력:
 * - class_name: 선택된 클래스 이름
 * - usage: LLM 토큰 사용량
 * - class_{id}_branch: 각 클래스별 분기 핸들 (boolean)
 */
export function generateQuestionClassifierPortSchema(
  classes: Topic[],
  visionConfig?: VisionConfig
): NodePortSchema {
  // 1. 입력 포트 생성
  const inputs: PortDefinition[] = [
    {
      name: 'query',
      type: PortType.STRING,
      required: true,
      description: 'Text to classify',
      display_name: 'Query',
    },
  ];

  // Vision이 활성화된 경우 files 입력 추가
  if (visionConfig?.enabled) {
    inputs.push({
      name: 'files',
      type: PortType.ARRAY_FILE,
      required: false,
      description: 'Image files for vision classification',
      display_name: 'Files',
    });
  }

  // 2. 출력 포트 생성
  const outputs: PortDefinition[] = [
    {
      name: 'class_name',
      type: PortType.STRING,
      required: true,
      description: 'Selected class name',
      display_name: 'Class Name',
    },
    {
      name: 'usage',
      type: PortType.OBJECT,
      required: true,
      description: 'LLM token usage information',
      display_name: 'Usage',
    },
  ];

  // 3. 각 클래스별 브랜치 출력 추가
  classes.forEach((topic) => {
    const baseId = topic.id?.startsWith('class_') ? topic.id : `class_${topic.id}`;
    const branchName = `${baseId}_branch`;

    outputs.push({
      name: branchName,
      type: PortType.BOOLEAN,
      required: true,
      description: `Branch for class: ${topic.name || 'Unnamed'}`,
      display_name: topic.name || 'Unnamed',
    });
  });

  return {
    inputs,
    outputs,
  };
}
