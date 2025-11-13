// src/features/workflow/utils/__tests__/portValidation.test.ts

import { describe, it, expect } from 'vitest';
import {
  validatePortConnection,
  validateRequiredInputs,
  validateMultipleConnections,
} from '../portValidation';
import { PortType } from '@shared/types/workflow';
import type { PortDefinition } from '@shared/types/workflow';

describe('portValidation', () => {
  describe('validatePortConnection', () => {
    it('동일한 타입의 포트는 연결 가능', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.STRING,
        display_name: '출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.STRING,
        display_name: '입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('호환되지 않는 타입은 연결 불가', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.STRING,
        display_name: '출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.NUMBER,
        display_name: '입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('타입 불일치');
    });

    it('ANY 타입은 모든 타입과 연결 가능 (경고 포함)', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.ANY,
        display_name: '출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.STRING,
        display_name: '입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(true);
      expect(result.warning).toContain('ANY 타입 연결');
    });

    it('ANY 타입끼리는 경고 없이 연결 가능', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.ANY,
        display_name: '출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.ANY,
        display_name: '입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('ARRAY는 ARRAY와 연결 가능', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.ARRAY,
        display_name: '배열 출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.ARRAY,
        display_name: '배열 입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(true);
    });

    it('OBJECT는 OBJECT와 연결 가능', () => {
      const sourcePort: PortDefinition = {
        name: 'output',
        type: PortType.OBJECT,
        display_name: '객체 출력',
        required: false,
      };

      const targetPort: PortDefinition = {
        name: 'input',
        type: PortType.OBJECT,
        display_name: '객체 입력',
        required: true,
      };

      const result = validatePortConnection(sourcePort, targetPort);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateRequiredInputs', () => {
    it('모든 필수 포트가 연결되면 유효', () => {
      const inputPorts: PortDefinition[] = [
        {
          name: 'input1',
          type: PortType.STRING,
          display_name: '입력1',
          required: true,
        },
        {
          name: 'input2',
          type: PortType.NUMBER,
          display_name: '입력2',
          required: false,
        },
      ];

      const connectedPorts = new Set(['input1']);

      const result = validateRequiredInputs(inputPorts, connectedPorts);

      expect(result.valid).toBe(true);
    });

    it('필수 포트가 연결되지 않으면 에러', () => {
      const inputPorts: PortDefinition[] = [
        {
          name: 'input1',
          type: PortType.STRING,
          display_name: '입력1',
          required: true,
        },
        {
          name: 'input2',
          type: PortType.NUMBER,
          display_name: '입력2',
          required: true,
        },
      ];

      const connectedPorts = new Set(['input1']);

      const result = validateRequiredInputs(inputPorts, connectedPorts);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 입력 포트가 연결되지 않음');
      expect(result.error).toContain('입력2');
    });

    it('필수 포트가 없으면 항상 유효', () => {
      const inputPorts: PortDefinition[] = [
        {
          name: 'input1',
          type: PortType.STRING,
          display_name: '입력1',
          required: false,
        },
      ];

      const connectedPorts = new Set<string>();

      const result = validateRequiredInputs(inputPorts, connectedPorts);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateMultipleConnections', () => {
    it('다중 연결이 허용되면 이미 연결된 포트도 연결 가능', () => {
      const result = validateMultipleConnections(
        'input1',
        ['input1'],
        true // allowMultiple
      );

      expect(result.valid).toBe(true);
    });

    it('다중 연결이 불가능하면 이미 연결된 포트는 에러', () => {
      const result = validateMultipleConnections(
        'input1',
        ['input1'],
        false // allowMultiple
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('이미 연결되어 있습니다');
    });

    it('연결되지 않은 포트는 항상 연결 가능', () => {
      const result = validateMultipleConnections(
        'input2',
        ['input1'],
        false // allowMultiple
      );

      expect(result.valid).toBe(true);
    });

    it('기본값(allowMultiple=false)으로 다중 연결 검증', () => {
      const result = validateMultipleConnections('input1', ['input1']);

      expect(result.valid).toBe(false);
    });
  });
});
