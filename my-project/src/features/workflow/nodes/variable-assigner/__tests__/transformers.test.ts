import { describe, it, expect } from 'vitest';
import {
  valueSelectorToReference,
  referenceToValueSelector,
  toBackendFormat,
  fromBackendFormat,
} from '../api/transformers';
import { VarType } from '../types';
import type { VariableAssignerNodeData } from '../types';

describe('transformers', () => {
  describe('valueSelectorToReference', () => {
    it('배열 형식을 문자열 형식으로 변환해야 함', () => {
      const selector = ['node_id', 'port_name'];
      const result = valueSelectorToReference(selector);
      expect(result).toBe('node_id.port_name');
    });

    it('3개 이상의 요소를 가진 배열도 변환해야 함', () => {
      const selector = ['node_id', 'nested', 'port_name'];
      const result = valueSelectorToReference(selector);
      expect(result).toBe('node_id.nested.port_name');
    });

    it('단일 요소 배열도 변환해야 함', () => {
      const selector = ['node_id'];
      const result = valueSelectorToReference(selector);
      expect(result).toBe('node_id');
    });
  });

  describe('referenceToValueSelector', () => {
    it('문자열 형식을 배열 형식으로 변환해야 함', () => {
      const reference = 'node_id.port_name';
      const result = referenceToValueSelector(reference);
      expect(result).toEqual(['node_id', 'port_name']);
    });

    it('3개 이상의 세그먼트를 가진 문자열도 변환해야 함', () => {
      const reference = 'node_id.nested.port_name';
      const result = referenceToValueSelector(reference);
      expect(result).toEqual(['node_id', 'nested', 'port_name']);
    });

    it('단일 세그먼트 문자열도 변환해야 함', () => {
      const reference = 'node_id';
      const result = referenceToValueSelector(reference);
      expect(result).toEqual(['node_id']);
    });
  });

  describe('valueSelectorToReference와 referenceToValueSelector의 상호 변환', () => {
    it('양방향 변환이 원본과 동일해야 함', () => {
      const originalSelector = ['node_id', 'port_name'];
      const reference = valueSelectorToReference(originalSelector);
      const backToSelector = referenceToValueSelector(reference);
      expect(backToSelector).toEqual(originalSelector);
    });

    it('문자열에서 시작한 양방향 변환이 원본과 동일해야 함', () => {
      const originalReference = 'node_id.port_name';
      const selector = referenceToValueSelector(originalReference);
      const backToReference = valueSelectorToReference(selector);
      expect(backToReference).toBe(originalReference);
    });
  });

  describe('toBackendFormat', () => {
    it('단일 모드 데이터를 백엔드 포맷으로 변환해야 함 (기본 포트 생성)', () => {
      const frontendData: VariableAssignerNodeData = {
        output_type: VarType.STRING,
        variables: [
          ['llm_node_1', 'response'],
          ['llm_node_2', 'output'],
        ],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
      };

      const result = toBackendFormat(frontendData);

      expect(result.type).toBe('variable-assigner');
      expect(result.config.output_type).toBe(VarType.STRING);
      expect(result.config.variables).toEqual([
        'llm_node_1.response',
        'llm_node_2.output',
      ]);
      expect(result.ports.outputs).toHaveLength(1);
      expect(result.ports.outputs[0].name).toBe('output');
      expect(result.ports.outputs[0].type).toBe(VarType.STRING);
      expect(result.variable_mappings).toEqual({});
    });

    it('기존 ports와 variable_mappings를 보존해야 함', () => {
      const existingPorts = {
        inputs: [
          {
            name: 'custom_input',
            type: VarType.STRING,
            required: true,
            description: '커스텀 입력',
            display_name: '커스텀',
          },
        ],
        outputs: [
          {
            name: 'custom_output',
            type: VarType.OBJECT,
            required: true,
            description: '커스텀 출력',
            display_name: '결과',
          },
        ],
      };

      const existingMappings = {
        input1: {
          target_port: 'custom_input',
          source: {
            variable: 'node1.output',
            value_type: VarType.STRING,
          },
        },
      };

      const frontendData: VariableAssignerNodeData = {
        output_type: VarType.STRING,
        variables: [['llm_node_1', 'response']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
        ports: existingPorts,
        variable_mappings: existingMappings,
      };

      const result = toBackendFormat(frontendData);

      expect(result.ports).toBe(existingPorts);
      expect(result.variable_mappings).toBe(existingMappings);
    });

    it('그룹 모드 데이터를 백엔드 포맷으로 변환해야 함', () => {
      const frontendData: VariableAssignerNodeData = {
        output_type: VarType.ANY,
        variables: [],
        advanced_settings: {
          group_enabled: true,
          groups: [
            {
              groupId: 'group-1',
              group_name: 'Group1',
              output_type: VarType.STRING,
              variables: [['llm_node_1', 'response']],
            },
            {
              groupId: 'group-2',
              group_name: 'Group2',
              output_type: VarType.NUMBER,
              variables: [['calculator_node', 'result']],
            },
          ],
        },
      };

      const result = toBackendFormat(frontendData);

      expect(result.type).toBe('variable-assigner');
      expect(result.config.group_enabled).toBe(true);
      expect(result.config.groups).toHaveLength(2);
      expect(result.config.groups[0].group_name).toBe('Group1');
      expect(result.config.groups[0].variables).toEqual(['llm_node_1.response']);
      expect(result.config.groups[1].group_name).toBe('Group2');
      expect(result.config.groups[1].variables).toEqual(['calculator_node.result']);
      expect(result.ports.outputs).toHaveLength(2);
      expect(result.ports.outputs[0].name).toBe('Group1.output');
      expect(result.ports.outputs[1].name).toBe('Group2.output');
    });
  });

  describe('fromBackendFormat', () => {
    it('백엔드 단일 모드 데이터를 프론트엔드 포맷으로 변환해야 함', () => {
      const backendData = {
        type: 'variable-assigner',
        config: {
          output_type: VarType.STRING,
          variables: ['llm_node_1.response', 'llm_node_2.output'],
        },
        ports: {
          inputs: [],
          outputs: [
            {
              name: 'output',
              type: VarType.STRING,
              required: true,
              description: '출력',
              display_name: '결과',
            },
          ],
        },
        variable_mappings: {},
      };

      const result = fromBackendFormat(backendData);

      expect(result.output_type).toBe(VarType.STRING);
      expect(result.variables).toEqual([
        ['llm_node_1', 'response'],
        ['llm_node_2', 'output'],
      ]);
      expect(result.advanced_settings.group_enabled).toBe(false);
      expect(result.advanced_settings.groups).toHaveLength(0);
      expect(result.ports).toBe(backendData.ports);
      expect(result.variable_mappings).toBe(backendData.variable_mappings);
    });

    it('백엔드에서 받은 ports와 variable_mappings를 보존해야 함', () => {
      const backendPorts = {
        inputs: [
          {
            name: 'backend_input',
            type: VarType.OBJECT,
            required: true,
            description: '백엔드 입력',
            display_name: '입력',
          },
        ],
        outputs: [
          {
            name: 'backend_output',
            type: VarType.ARRAY,
            required: true,
            description: '백엔드 출력',
            display_name: '출력',
          },
        ],
      };

      const backendMappings = {
        mapping1: {
          target_port: 'backend_input',
          source: {
            variable: 'source_node.data',
            value_type: VarType.OBJECT,
          },
        },
      };

      const backendData = {
        type: 'variable-assigner',
        config: {
          output_type: VarType.STRING,
          variables: ['llm_node_1.response'],
        },
        ports: backendPorts,
        variable_mappings: backendMappings,
      };

      const result = fromBackendFormat(backendData);

      expect(result.ports).toBe(backendPorts);
      expect(result.variable_mappings).toBe(backendMappings);
    });

    it('백엔드 그룹 모드 데이터를 프론트엔드 포맷으로 변환해야 함', () => {
      const backendData = {
        type: 'variable-assigner',
        config: {
          group_enabled: true,
          groups: [
            {
              groupId: 'group-1',
              group_name: 'Group1',
              output_type: VarType.STRING,
              variables: ['llm_node_1.response'],
            },
            {
              groupId: 'group-2',
              group_name: 'Group2',
              output_type: VarType.NUMBER,
              variables: ['calculator_node.result'],
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
              description: 'Group1 출력',
              display_name: 'Group1',
            },
            {
              name: 'Group2.output',
              type: VarType.NUMBER,
              required: true,
              description: 'Group2 출력',
              display_name: 'Group2',
            },
          ],
        },
        variable_mappings: {},
      };

      const result = fromBackendFormat(backendData);

      expect(result.output_type).toBe(VarType.ANY);
      expect(result.variables).toEqual([]);
      expect(result.advanced_settings.group_enabled).toBe(true);
      expect(result.advanced_settings.groups).toHaveLength(2);
      expect(result.advanced_settings.groups[0].group_name).toBe('Group1');
      expect(result.advanced_settings.groups[0].variables).toEqual([
        ['llm_node_1', 'response'],
      ]);
      expect(result.advanced_settings.groups[1].group_name).toBe('Group2');
      expect(result.advanced_settings.groups[1].variables).toEqual([
        ['calculator_node', 'result'],
      ]);
      expect(result.ports).toBe(backendData.ports);
      expect(result.variable_mappings).toBe(backendData.variable_mappings);
    });
  });

  describe('toBackendFormat와 fromBackendFormat의 상호 변환', () => {
    it('단일 모드 양방향 변환이 일관성 있어야 함', () => {
      const originalData: VariableAssignerNodeData = {
        output_type: VarType.STRING,
        variables: [['llm_node_1', 'response']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
      };

      const backendFormat = toBackendFormat(originalData);
      const backToFrontend = fromBackendFormat(backendFormat);

      expect(backToFrontend.output_type).toBe(originalData.output_type);
      expect(backToFrontend.variables).toEqual(originalData.variables);
      expect(backToFrontend.advanced_settings.group_enabled).toBe(false);
    });

    it('그룹 모드 양방향 변환이 일관성 있어야 함', () => {
      const originalData: VariableAssignerNodeData = {
        output_type: VarType.ANY,
        variables: [],
        advanced_settings: {
          group_enabled: true,
          groups: [
            {
              groupId: 'group-1',
              group_name: 'UserData',
              output_type: VarType.OBJECT,
              variables: [['user_node', 'profile']],
            },
          ],
        },
      };

      const backendFormat = toBackendFormat(originalData);
      const backToFrontend = fromBackendFormat(backendFormat);

      expect(backToFrontend.advanced_settings.group_enabled).toBe(true);
      expect(backToFrontend.advanced_settings.groups).toHaveLength(1);
      expect(backToFrontend.advanced_settings.groups[0].group_name).toBe(
        'UserData'
      );
      expect(backToFrontend.advanced_settings.groups[0].variables).toEqual([
        ['user_node', 'profile'],
      ]);
    });

    it('ports와 variable_mappings가 양방향 변환에서 보존되어야 함', () => {
      const customPorts = {
        inputs: [],
        outputs: [
          {
            name: 'custom',
            type: VarType.STRING,
            required: true,
            description: '커스텀 포트',
            display_name: '커스텀',
          },
        ],
      };

      const customMappings = {
        test: {
          target_port: 'input',
          source: {
            variable: 'node.output',
            value_type: VarType.STRING,
          },
        },
      };

      const originalData: VariableAssignerNodeData = {
        output_type: VarType.STRING,
        variables: [['llm_node_1', 'response']],
        advanced_settings: {
          group_enabled: false,
          groups: [],
        },
        ports: customPorts,
        variable_mappings: customMappings,
      };

      const backendFormat = toBackendFormat(originalData);
      const backToFrontend = fromBackendFormat(backendFormat);

      expect(backToFrontend.ports).toEqual(customPorts);
      expect(backToFrontend.variable_mappings).toEqual(customMappings);
    });
  });
});
