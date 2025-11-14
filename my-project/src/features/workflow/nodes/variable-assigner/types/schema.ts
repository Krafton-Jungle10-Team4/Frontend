import { z } from 'zod';
import { VarType } from './index';

// ==================== Zod Schemas ====================

/**
 * VarType enum 스키마
 */
export const VarTypeSchema = z.nativeEnum(VarType);

/**
 * ValueSelector 스키마
 * 최소 1개 이상의 문자열 배열
 */
export const ValueSelectorSchema = z.array(z.string()).min(1);

/**
 * VarGroupItem 스키마
 */
export const VarGroupItemSchema = z.object({
  output_type: VarTypeSchema,
  variables: z.array(ValueSelectorSchema),
});

/**
 * VariableGroup 스키마
 */
export const VariableGroupSchema = VarGroupItemSchema.extend({
  groupId: z.string().uuid(),
  group_name: z.string().min(1).max(30),
});

/**
 * PortDefinition 스키마
 * 백엔드 포트 정의와 일치
 */
export const PortDefinitionSchema = z.object({
  name: z.string(),
  type: VarTypeSchema,
  required: z.boolean(),
  default_value: z.unknown().optional(),
  description: z.string().optional(),
  display_name: z.string().optional(),
});

/**
 * VariableMapping 스키마
 * 백엔드 변수 매핑과 일치
 */
export const VariableMappingSchema = z.object({
  target_port: z.string(),
  source: z.object({
    variable: z.string(),
    value_type: VarTypeSchema,
  }),
});

/**
 * VariableAssignerNodeData 스키마
 * ports와 variable_mappings를 포함하여 백엔드 연동 필드 보존
 * .passthrough()로 향후 확장 필드도 유지
 */
export const VariableAssignerNodeDataSchema = z
  .object({
    output_type: VarTypeSchema,
    variables: z.array(ValueSelectorSchema),
    advanced_settings: z.object({
      group_enabled: z.boolean(),
      groups: z.array(VariableGroupSchema),
    }),
    ports: z
      .object({
        inputs: z.array(PortDefinitionSchema),
        outputs: z.array(PortDefinitionSchema),
      })
      .optional(),
    variable_mappings: z.record(z.string(), VariableMappingSchema).optional(),
  })
  .passthrough();

// ==================== Validation Functions ====================

/**
 * 노드 데이터 검증
 * @param data - 검증할 노드 데이터
 * @returns Zod 검증 결과
 */
export function validateNodeData(data: unknown) {
  return VariableAssignerNodeDataSchema.safeParse(data);
}

/**
 * 그룹 이름 검증
 * 영문, 숫자, 언더스코어, 하이픈만 허용 (1~30자)
 * @param name - 검증할 그룹 이름
 * @returns 유효성 여부
 */
export function validateGroupName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,30}$/.test(name);
}
