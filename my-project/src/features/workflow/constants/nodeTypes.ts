import { BlockEnum } from '@/shared/types/workflow.types';
import type { NodeTypeResponse } from '../types/api.types';
import { VarType } from '../nodes/variable-assigner/types';
import { generateIfElsePortSchema } from '../components/nodes/if-else/utils/portSchemaGenerator';
import { generateQuestionClassifierPortSchema } from '../components/nodes/question-classifier/utils/portSchemaGenerator';

export const VARIABLE_ASSIGNER_ICON = 'variableAssigner';
export const IF_ELSE_ICON = 'branch';
export const QUESTION_CLASSIFIER_ICON = 'classifier';

export const VARIABLE_ASSIGNER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.Assigner,
  label: 'Variable Assigner',
  icon: VARIABLE_ASSIGNER_ICON,
  description: 'Collect and regroup variables from previous nodes',
  max_instances: -1,
  configurable: true,
  default_data: {
    output_type: VarType.ANY,
    variables: [],
    advanced_settings: {
      group_enabled: false,
      groups: [],
    },
  },
};

export const IF_ELSE_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.IfElse,
  label: 'IF-ELSE',
  icon: IF_ELSE_ICON,
  description: 'Conditional branching based on variable conditions',
  max_instances: -1,
  configurable: true,
  default_data: {
    cases: [],
  },
  ports: generateIfElsePortSchema([]), // 빈 cases에 대한 기본 포트 (ELSE만 존재)
};

export const QUESTION_CLASSIFIER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.QuestionClassifier,
  label: 'Question Classifier',
  icon: QUESTION_CLASSIFIER_ICON,
  description: 'Classify questions into predefined categories using AI',
  max_instances: -1,
  configurable: true,
  default_data: {
    classes: [],
    model: {
      provider: 'openai',
      name: 'gpt-4',
      mode: 'chat' as const,
      completion_params: {
        temperature: 0.7,
      },
    },
    query_variable_selector: [],
    vision: {
      enabled: false,
    },
  },
  ports: generateQuestionClassifierPortSchema([], { enabled: false }), // 빈 classes에 대한 기본 포트
};

export const cloneVariableAssignerNodeType = (): NodeTypeResponse => ({
  ...VARIABLE_ASSIGNER_NODE_TYPE,
  default_data: {
    ...(VARIABLE_ASSIGNER_NODE_TYPE.default_data || {}),
    advanced_settings: {
      ...((VARIABLE_ASSIGNER_NODE_TYPE.default_data?.advanced_settings as Record<
        string,
        unknown
      >) || {}),
      groups: [],
    },
  },
});

export const cloneIfElseNodeType = (): NodeTypeResponse => ({
  ...IF_ELSE_NODE_TYPE,
  default_data: {
    cases: [],
  },
  ports: generateIfElsePortSchema([]), // 빈 cases에 대한 기본 포트
});

export const cloneQuestionClassifierNodeType = (): NodeTypeResponse => ({
  ...QUESTION_CLASSIFIER_NODE_TYPE,
  default_data: {
    classes: [],
    model: {
      provider: 'openai',
      name: 'gpt-4',
      mode: 'chat' as const,
      completion_params: {
        temperature: 0.7,
      },
    },
    query_variable_selector: [],
    vision: {
      enabled: false,
    },
  },
  ports: generateQuestionClassifierPortSchema([], { enabled: false }), // 빈 classes에 대한 기본 포트
});
