import { describe, it, expect } from 'vitest';
import {
  validateNodeData,
  validateGroupName,
  VariableAssignerNodeDataSchema,
} from '../types/schema';
import { VarType } from '../types';

describe('Variable Assigner Schema Validation', () => {
  describe('validateNodeData', () => {
    it('기본 필드만 있는 데이터를 검증해야 함', () => {
      const data = {
        output_type: VarType.STRING,
        variables: [['node1', 'output']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
      };

      const result = validateNodeData(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('ports 필드가 포함된 데이터를 검증하고 필드를 보존해야 함', () => {
      const data = {
        output_type: VarType.STRING,
        variables: [['node1', 'output']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
        ports: {
          inputs: [
            {
              name: 'input1',
              type: VarType.STRING,
              required: true,
              description: 'Test input',
              display_name: 'Input 1',
            },
          ],
          outputs: [
            {
              name: 'output',
              type: VarType.STRING,
              required: true,
              description: 'Test output',
              display_name: 'Output',
            },
          ],
        },
      };

      const result = validateNodeData(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ports).toBeDefined();
        expect(result.data.ports?.inputs).toHaveLength(1);
        expect(result.data.ports?.outputs).toHaveLength(1);
        expect(result.data.ports?.inputs[0].name).toBe('input1');
      }
    });

    it('variable_mappings 필드가 포함된 데이터를 검증하고 필드를 보존해야 함', () => {
      const data = {
        output_type: VarType.STRING,
        variables: [['node1', 'output']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
        variable_mappings: {
          input1: {
            target_port: 'input1',
            source: {
              variable: 'node1.output',
              value_type: VarType.STRING,
            },
          },
        },
      };

      const result = validateNodeData(data);
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.variable_mappings).toBeDefined();
        expect(result.data.variable_mappings?.input1).toBeDefined();
        expect(result.data.variable_mappings?.input1.target_port).toBe(
          'input1'
        );
        expect(result.data.variable_mappings?.input1.source.variable).toBe(
          'node1.output'
        );
      }
    });

    it('ports와 variable_mappings가 모두 포함된 데이터를 검증해야 함', () => {
      const data = {
        output_type: VarType.OBJECT,
        variables: [
          ['node1', 'data'],
          ['node2', 'result'],
        ],
        advanced_settings: {
          group_enabled: true,
          groups: [
            {
              groupId: '123e4567-e89b-12d3-a456-426614174000',
              group_name: 'Group1',
              output_type: VarType.STRING,
              variables: [['node1', 'text']],
            },
          ],
        },
        ports: {
          inputs: [],
          outputs: [
            {
              name: 'Group1.output',
              type: VarType.STRING,
              required: true,
              description: 'Group1 output',
              display_name: 'Group1',
            },
          ],
        },
        variable_mappings: {
          'Group1.output': {
            target_port: 'Group1.output',
            source: {
              variable: 'node1.text',
              value_type: VarType.STRING,
            },
          },
        },
      };

      const result = validateNodeData(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ports).toBeDefined();
        expect(result.data.variable_mappings).toBeDefined();
        expect(result.data.ports?.outputs).toHaveLength(1);
        expect(
          Object.keys(result.data.variable_mappings || {})
        ).toHaveLength(1);
      }
    });

    it('.passthrough()로 인해 미래 확장 필드도 보존해야 함', () => {
      const data = {
        output_type: VarType.STRING,
        variables: [['node1', 'output']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
        // 미래에 추가될 수 있는 필드
        future_field: 'some_value',
        experimental_config: {
          enabled: true,
          options: ['opt1', 'opt2'],
        },
      };

      const result = VariableAssignerNodeDataSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).future_field).toBe('some_value');
        expect((result.data as any).experimental_config).toEqual({
          enabled: true,
          options: ['opt1', 'opt2'],
        });
      }
    });

    it('잘못된 데이터는 검증에 실패해야 함', () => {
      const invalidData = {
        output_type: 'invalid_type',
        variables: [],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
      };

      const result = validateNodeData(invalidData);
      expect(result.success).toBe(false);
    });

    it('그룹 ID가 유효한 UUID가 아니면 검증에 실패해야 함', () => {
      const data = {
        output_type: VarType.STRING,
        variables: [['node1', 'output']],
        advanced_settings: {
          group_enabled: true,
          groups: [
            {
              groupId: 'invalid-uuid',
              group_name: 'Group1',
              output_type: VarType.STRING,
              variables: [['node1', 'text']],
            },
          ],
        },
      };

      const result = validateNodeData(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateGroupName', () => {
    it('유효한 그룹 이름을 허용해야 함', () => {
      expect(validateGroupName('Group1')).toBe(true);
      expect(validateGroupName('user_data')).toBe(true);
      expect(validateGroupName('test-group')).toBe(true);
      expect(validateGroupName('ABC123')).toBe(true);
    });

    it('유효하지 않은 그룹 이름을 거부해야 함', () => {
      expect(validateGroupName('')).toBe(false);
      expect(validateGroupName('group name with spaces')).toBe(false);
      expect(validateGroupName('group@name')).toBe(false);
      expect(validateGroupName('그룹이름')).toBe(false);
      expect(validateGroupName('a'.repeat(31))).toBe(false);
    });

    it('특수문자가 포함된 이름을 거부해야 함', () => {
      expect(validateGroupName('group!name')).toBe(false);
      expect(validateGroupName('group#name')).toBe(false);
      expect(validateGroupName('group$name')).toBe(false);
    });
  });
});
