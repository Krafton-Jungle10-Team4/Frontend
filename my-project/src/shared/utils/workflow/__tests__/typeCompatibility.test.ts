import { describe, it, expect } from 'vitest';
import { areTypesCompatible, getCompatibleTypes, validateEdgeConnection } from '../typeCompatibility';
import { PortType } from '@shared/types/workflow';

describe('typeCompatibility', () => {
  describe('areTypesCompatible', () => {
    it('같은 타입은 항상 호환', () => {
      expect(areTypesCompatible(PortType.STRING, PortType.STRING)).toBe(true);
      expect(areTypesCompatible(PortType.NUMBER, PortType.NUMBER)).toBe(true);
      expect(areTypesCompatible(PortType.BOOLEAN, PortType.BOOLEAN)).toBe(true);
      expect(areTypesCompatible(PortType.ARRAY, PortType.ARRAY)).toBe(true);
      expect(areTypesCompatible(PortType.OBJECT, PortType.OBJECT)).toBe(true);
      expect(areTypesCompatible(PortType.FILE, PortType.FILE)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.ANY)).toBe(true);
    });

    it('ANY는 모든 타입 허용 (source)', () => {
      expect(areTypesCompatible(PortType.ANY, PortType.STRING)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.NUMBER)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.BOOLEAN)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.ARRAY)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.OBJECT)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.FILE)).toBe(true);
      expect(areTypesCompatible(PortType.ANY, PortType.ANY)).toBe(true);
    });

    it('ANY는 모든 타입 허용 (target)', () => {
      expect(areTypesCompatible(PortType.STRING, PortType.ANY)).toBe(true);
      expect(areTypesCompatible(PortType.NUMBER, PortType.ANY)).toBe(true);
      expect(areTypesCompatible(PortType.BOOLEAN, PortType.ANY)).toBe(true);
      expect(areTypesCompatible(PortType.ARRAY, PortType.ANY)).toBe(true);
      expect(areTypesCompatible(PortType.OBJECT, PortType.ANY)).toBe(true);
      expect(areTypesCompatible(PortType.FILE, PortType.ANY)).toBe(true);
    });

    it('다른 타입은 호환 불가', () => {
      expect(areTypesCompatible(PortType.STRING, PortType.NUMBER)).toBe(false);
      expect(areTypesCompatible(PortType.STRING, PortType.BOOLEAN)).toBe(false);
      expect(areTypesCompatible(PortType.NUMBER, PortType.STRING)).toBe(false);
      expect(areTypesCompatible(PortType.ARRAY, PortType.OBJECT)).toBe(false);
      expect(areTypesCompatible(PortType.OBJECT, PortType.ARRAY)).toBe(false);
      expect(areTypesCompatible(PortType.BOOLEAN, PortType.NUMBER)).toBe(false);
    });
  });

  describe('getCompatibleTypes', () => {
    it('STRING 타입 호환 목록', () => {
      const compatible = getCompatibleTypes(PortType.STRING);
      expect(compatible).toContain(PortType.STRING);
      expect(compatible).toContain(PortType.ANY);
      expect(compatible).toHaveLength(2);
    });

    it('NUMBER 타입 호환 목록', () => {
      const compatible = getCompatibleTypes(PortType.NUMBER);
      expect(compatible).toContain(PortType.NUMBER);
      expect(compatible).toContain(PortType.ANY);
      expect(compatible).toHaveLength(2);
    });

    it('ANY 타입 호환 목록 (모든 타입)', () => {
      const compatible = getCompatibleTypes(PortType.ANY);
      expect(compatible).toContain(PortType.STRING);
      expect(compatible).toContain(PortType.NUMBER);
      expect(compatible).toContain(PortType.BOOLEAN);
      expect(compatible).toContain(PortType.ARRAY);
      expect(compatible).toContain(PortType.OBJECT);
      expect(compatible).toContain(PortType.FILE);
      expect(compatible).toContain(PortType.ANY);
      expect(compatible).toHaveLength(7);
    });
  });

  describe('validateEdgeConnection', () => {
    it('엣지 연결 검증 - 성공 (같은 타입)', () => {
      const result = validateEdgeConnection(
        PortType.STRING,
        PortType.STRING,
        'output',
        'input'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('엣지 연결 검증 - 성공 (source ANY)', () => {
      const result = validateEdgeConnection(
        PortType.ANY,
        PortType.STRING,
        'output',
        'input'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('엣지 연결 검증 - 성공 (target ANY)', () => {
      const result = validateEdgeConnection(
        PortType.STRING,
        PortType.ANY,
        'output',
        'input'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('엣지 연결 검증 - 실패 (타입 불일치)', () => {
      const result = validateEdgeConnection(
        PortType.STRING,
        PortType.NUMBER,
        'output',
        'input'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('타입 불일치');
      expect(result.error).toContain('output');
      expect(result.error).toContain('input');
      expect(result.error).toContain('string');
      expect(result.error).toContain('number');
    });

    it('엣지 연결 검증 - 실패 (ARRAY → OBJECT)', () => {
      const result = validateEdgeConnection(
        PortType.ARRAY,
        PortType.OBJECT,
        'array_output',
        'object_input'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('타입 불일치');
    });

    it('엣지 연결 검증 - 모든 타입 조합 테스트', () => {
      // STRING 타입
      expect(validateEdgeConnection(PortType.STRING, PortType.STRING, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.STRING, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.STRING, PortType.NUMBER, 'o', 'i').valid).toBe(false);

      // NUMBER 타입
      expect(validateEdgeConnection(PortType.NUMBER, PortType.NUMBER, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.NUMBER, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.NUMBER, PortType.STRING, 'o', 'i').valid).toBe(false);

      // BOOLEAN 타입
      expect(validateEdgeConnection(PortType.BOOLEAN, PortType.BOOLEAN, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.BOOLEAN, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.BOOLEAN, PortType.STRING, 'o', 'i').valid).toBe(false);

      // ARRAY 타입
      expect(validateEdgeConnection(PortType.ARRAY, PortType.ARRAY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.ARRAY, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.ARRAY, PortType.OBJECT, 'o', 'i').valid).toBe(false);

      // OBJECT 타입
      expect(validateEdgeConnection(PortType.OBJECT, PortType.OBJECT, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.OBJECT, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.OBJECT, PortType.ARRAY, 'o', 'i').valid).toBe(false);

      // FILE 타입
      expect(validateEdgeConnection(PortType.FILE, PortType.FILE, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.FILE, PortType.ANY, 'o', 'i').valid).toBe(true);
      expect(validateEdgeConnection(PortType.FILE, PortType.STRING, 'o', 'i').valid).toBe(false);
    });
  });
});
