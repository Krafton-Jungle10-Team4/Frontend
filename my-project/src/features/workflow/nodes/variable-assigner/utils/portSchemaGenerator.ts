import type {
  VariableAssignerNodeData,
  PortDefinition,
} from '../types'

/**
 * Variable Assigner 노드의 포트 스키마 동적 생성
 */
export function generatePortSchema(
  data: VariableAssignerNodeData
): { inputs: PortDefinition[]; outputs: PortDefinition[] } {
  const { advanced_settings } = data

  if (!advanced_settings.group_enabled) {
    return {
      inputs: [],
      outputs: [
        {
          name: 'output',
          type: data.output_type,
          required: true,
          description: 'Aggregated variable output',
          display_name: 'Output',
        },
      ],
    }
  }

  return {
    inputs: [],
    outputs: advanced_settings.groups.map(group => ({
      name: `${group.group_name}.output`,
      type: group.output_type,
      required: true,
      description: `${group.group_name} group output`,
      display_name: group.group_name,
    })),
  }
}
