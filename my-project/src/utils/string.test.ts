import { describe, it, expect } from 'vitest';
import { capitalize, truncate } from './string';

describe('문자열 유틸리티', () => {
  describe('capitalize', () => {
    it('첫 글자를 대문자로 변환해야 함', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('이미 대문자인 경우 그대로 반환해야 함', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('빈 문자열은 빈 문자열을 반환해야 함', () => {
      expect(capitalize('')).toBe('');
    });

    it('한 글자 문자열도 처리해야 함', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('truncate', () => {
    it('문자열이 최대 길이보다 길면 잘라야 함', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('문자열이 최대 길이보다 짧으면 그대로 반환해야 함', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('문자열이 최대 길이와 같으면 그대로 반환해야 함', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('빈 문자열은 빈 문자열을 반환해야 함', () => {
      expect(truncate('', 5)).toBe('');
    });
  });
});
