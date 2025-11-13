import { BlockEnum } from '@/shared/types/workflow.types';
import type { TemplateTransformNodeType } from '@/shared/types/workflow.types';

/**
 * Template Transform 노드 기본값
 */
export const DEFAULT_TEMPLATE_TRANSFORM_CONFIG: Partial<TemplateTransformNodeType> = {
  type: BlockEnum.TemplateTransform,
  title: 'Template Transform',
  template: '',
  outputFormat: 'plain',
};
