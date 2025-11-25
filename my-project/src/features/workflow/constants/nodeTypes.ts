import { BlockEnum } from '@/shared/types/workflow.types';
import type { NodeTypeResponse } from '../types/api.types';
import { VarType } from '../nodes/variable-assigner/types';
import {
  generateIfElsePortSchema,
  createDefaultIfElseCase,
} from '../components/nodes/if-else/utils/portSchemaGenerator';
import {
  generateQuestionClassifierPortSchema,
  createDefaultQuestionClassifierClasses,
} from '../components/nodes/question-classifier/utils/portSchemaGenerator';
import { generateAssignerPortSchema } from '../components/nodes/assigner/utils/portSchemaGenerator';
import { clonePortSchema } from '@/shared/constants/nodePortSchemas';

export const VARIABLE_ASSIGNER_ICON = 'variableAssigner';
export const ASSIGNER_ICON = 'assigner';
export const IF_ELSE_ICON = 'branch';
export const QUESTION_CLASSIFIER_ICON = 'classifier';
export const TAVILY_SEARCH_ICON = 'search';
export const ANSWER_ICON = 'message';

export const VARIABLE_ASSIGNER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.VariableAssigner,
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

export const ASSIGNER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.Assigner,
  label: 'Assigner',
  icon: ASSIGNER_ICON,
  description: 'Manipulate variables with various operations (set, append, arithmetic)',
  max_instances: -1,
  configurable: true,
  default_data: {
    version: '2',
    operations: [],
    ui_state: {
      expanded: true,
      selected_operation: undefined,
    },
  },
  ports: generateAssignerPortSchema([]), // Empty operations = no ports initially
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
  label: '질문 분류기',
  icon: QUESTION_CLASSIFIER_ICON,
  description: '질문 분류 노드',
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

export const cloneAssignerNodeType = (): NodeTypeResponse => ({
  ...ASSIGNER_NODE_TYPE,
  default_data: {
    version: '2',
    operations: [],
    ui_state: {
      expanded: true,
      selected_operation: undefined,
    },
  },
  ports: generateAssignerPortSchema([]), // Empty operations = no ports initially
});

export const cloneIfElseNodeType = (): NodeTypeResponse => {
  const defaultCases = [createDefaultIfElseCase()];
  return {
    ...IF_ELSE_NODE_TYPE,
    default_data: {
      cases: defaultCases,
    },
    ports: generateIfElsePortSchema(defaultCases),
  };
};

export const cloneQuestionClassifierNodeType = (): NodeTypeResponse => {
  const defaultClasses = createDefaultQuestionClassifierClasses();
  return {
    ...QUESTION_CLASSIFIER_NODE_TYPE,
    default_data: {
      classes: defaultClasses,
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
    ports: generateQuestionClassifierPortSchema(defaultClasses, {
      enabled: false,
    }),
  };
};

export const TAVILY_SEARCH_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.TavilySearch,
  label: 'Tavily Search',
  icon: TAVILY_SEARCH_ICON,
  description: '실시간 웹 검색을 수행하는 노드',
  max_instances: -1,
  configurable: true,
  default_data: {
    search_depth: 'basic',
    topic: 'general',
    max_results: 5,
    include_domains: [],
    exclude_domains: [],
    time_range: null,
    start_date: null,
    end_date: null,
    include_answer: false,
    include_raw_content: false,
  },
  ports: clonePortSchema(BlockEnum.TavilySearch),
};

export const cloneTavilySearchNodeType = (): NodeTypeResponse => ({
  ...TAVILY_SEARCH_NODE_TYPE,
  default_data: {
    search_depth: 'basic',
    topic: 'general',
    max_results: 5,
    include_domains: [],
    exclude_domains: [],
    time_range: null,
    start_date: null,
    end_date: null,
    include_answer: false,
    include_raw_content: false,
  },
  ports: clonePortSchema(BlockEnum.TavilySearch),
});

export const ANSWER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.Answer,
  label: 'Answer',
  icon: ANSWER_ICON,
  description: '워크플로우의 최종 응답을 정의합니다',
  max_instances: -1,
  configurable: true,
  default_data: {
    template: '',
    description: '',
  },
  ports: clonePortSchema(BlockEnum.Answer),
};

export const cloneAnswerNodeType = (): NodeTypeResponse => ({
  ...ANSWER_NODE_TYPE,
  default_data: {
    template: '',
    description: '',
  },
  ports: clonePortSchema(BlockEnum.Answer),
});
