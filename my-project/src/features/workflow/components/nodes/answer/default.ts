import { BlockEnum } from '@/shared/types/workflow.types';
import type { AnswerNodeType } from '@/shared/types/workflow.types';

/**
 * Answer 노드 기본값
 */
export const DEFAULT_ANSWER_CONFIG: Partial<AnswerNodeType> = {
  type: BlockEnum.Answer,
  title: 'Answer',
  desc: '최종 응답',
  template: '',
  description: '',
};
