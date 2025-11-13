import { describe, it, expect } from 'vitest';
import { getValueType, isValueOfType, validatePortValue } from '../typeValidation';
import { PortType } from '@shared/types/workflow';

describe('typeValidation', () => {
  describe('getValueType', () => {
    it('문자열 타입 감지', () => {
      expect(getValueType('hello')).toBe(PortType.STRING);
    });

    it('숫자 타입 감지', () => {
      expect(getValueType(42)).toBe(PortType.NUMBER);
    });

    it('불린 타입 감지', () => {
      expect(getValueType(true)).toBe(PortType.BOOLEAN);
      expect(getValueType(false)).toBe(PortType.BOOLEAN);
    });

    it('배열 타입 감지', () => {
      expect(getValueType([1, 2, 3])).toBe(PortType.ARRAY);
      expect(getValueType([])).toBe(PortType.ARRAY);
    });

    it('객체 타입 감지', () => {
      expect(getValueType({ key: 'value' })).toBe(PortType.OBJECT);
      expect(getValueType({})).toBe(PortType.OBJECT);
    });

    it('파일 타입 감지', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(getValueType(file)).toBe(PortType.FILE);
    });

    it('null은 ANY로 처리', () => {
      expect(getValueType(null)).toBe(PortType.ANY);
    });

    it('undefined는 ANY로 처리', () => {
      expect(getValueType(undefined)).toBe(PortType.ANY);
    });
  });

  describe('isValueOfType', () => {
    it('문자열 타입 일치 확인', () => {
      expect(isValueOfType('test', PortType.STRING)).toBe(true);
      expect(isValueOfType('test', PortType.NUMBER)).toBe(false);
    });

    it('숫자 타입 일치 확인', () => {
      expect(isValueOfType(42, PortType.NUMBER)).toBe(true);
      expect(isValueOfType(42, PortType.STRING)).toBe(false);
    });

    it('ANY 타입은 모든 값 허용', () => {
      expect(isValueOfType('test', PortType.ANY)).toBe(true);
      expect(isValueOfType(42, PortType.ANY)).toBe(true);
      expect(isValueOfType(true, PortType.ANY)).toBe(true);
      expect(isValueOfType([], PortType.ANY)).toBe(true);
      expect(isValueOfType({}, PortType.ANY)).toBe(true);
      expect(isValueOfType(null, PortType.ANY)).toBe(true);
    });

    it('배열 타입 일치 확인', () => {
      expect(isValueOfType([1, 2, 3], PortType.ARRAY)).toBe(true);
      expect(isValueOfType([1, 2, 3], PortType.OBJECT)).toBe(false);
    });

    it('객체 타입 일치 확인', () => {
      expect(isValueOfType({ key: 'value' }, PortType.OBJECT)).toBe(true);
      expect(isValueOfType({ key: 'value' }, PortType.ARRAY)).toBe(false);
    });
  });

  describe('validatePortValue', () => {
    it('필수 포트 검증 - 성공', () => {
      const result = validatePortValue('test', 'query', PortType.STRING, true);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('필수 포트 검증 - 실패 (값 없음)', () => {
      const result = validatePortValue(null, 'query', PortType.STRING, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 포트');
      expect(result.error).toContain('query');
    });

    it('필수 포트 검증 - 실패 (undefined)', () => {
      const result = validatePortValue(undefined, 'query', PortType.STRING, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 포트');
    });

    it('선택적 포트 - null 허용', () => {
      const result = validatePortValue(null, 'optional', PortType.STRING, false);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('선택적 포트 - undefined 허용', () => {
      const result = validatePortValue(undefined, 'optional', PortType.STRING, false);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('타입 불일치 검증', () => {
      const result = validatePortValue(42, 'query', PortType.STRING, true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('타입이 일치하지 않습니다');
      expect(result.error).toContain('query');
      expect(result.error).toContain('string');
      expect(result.error).toContain('number');
    });

    it('ANY 타입 포트 - 모든 값 허용', () => {
      expect(validatePortValue('test', 'any_port', PortType.ANY, true).valid).toBe(true);
      expect(validatePortValue(42, 'any_port', PortType.ANY, true).valid).toBe(true);
      expect(validatePortValue(true, 'any_port', PortType.ANY, true).valid).toBe(true);
      expect(validatePortValue([], 'any_port', PortType.ANY, true).valid).toBe(true);
      expect(validatePortValue({}, 'any_port', PortType.ANY, true).valid).toBe(true);
    });

    it('올바른 타입 값 검증', () => {
      expect(validatePortValue('text', 'str_port', PortType.STRING, true).valid).toBe(true);
      expect(validatePortValue(123, 'num_port', PortType.NUMBER, true).valid).toBe(true);
      expect(validatePortValue(true, 'bool_port', PortType.BOOLEAN, true).valid).toBe(true);
      expect(validatePortValue([1, 2], 'arr_port', PortType.ARRAY, true).valid).toBe(true);
      expect(validatePortValue({ a: 1 }, 'obj_port', PortType.OBJECT, true).valid).toBe(true);
    });
  });
});
