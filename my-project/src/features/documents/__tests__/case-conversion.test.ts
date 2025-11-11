/**
 * Case Conversion Utilities Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  snakeToCamel,
  camelToSnake,
  keysToCamel,
  keysToSnake,
  filterUndefined,
} from '../utils/case-conversion';

describe('Case Conversion Utilities', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_uuid')).toBe('userUuid');
      expect(snakeToCamel('document_id')).toBe('documentId');
      expect(snakeToCamel('original_filename')).toBe('originalFilename');
      expect(snakeToCamel('file_extension')).toBe('fileExtension');
    });

    it('should handle strings without underscores', () => {
      expect(snakeToCamel('simple')).toBe('simple');
      expect(snakeToCamel('test')).toBe('test');
    });

    it('should handle multiple underscores', () => {
      expect(snakeToCamel('very_long_field_name')).toBe('veryLongFieldName');
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('userUuid')).toBe('user_uuid');
      expect(camelToSnake('documentId')).toBe('document_id');
      expect(camelToSnake('originalFilename')).toBe('original_filename');
      expect(camelToSnake('fileExtension')).toBe('file_extension');
    });

    it('should handle strings without capitals', () => {
      expect(camelToSnake('simple')).toBe('simple');
      expect(camelToSnake('test')).toBe('test');
    });

    it('should handle multiple capitals', () => {
      expect(camelToSnake('veryLongFieldName')).toBe('very_long_field_name');
    });
  });

  describe('keysToCamel', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = {
        document_id: 'doc-123',
        user_uuid: 'user-456',
        original_filename: 'test.pdf',
      };

      const expected = {
        documentId: 'doc-123',
        userUuid: 'user-456',
        originalFilename: 'test.pdf',
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        document_info: {
          file_name: 'test.pdf',
          file_size: 1024,
        },
        user_data: {
          user_id: 'user-123',
        },
      };

      const expected = {
        documentInfo: {
          fileName: 'test.pdf',
          fileSize: 1024,
        },
        userData: {
          userId: 'user-123',
        },
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { document_id: 'doc-1', user_uuid: 'user-1' },
        { document_id: 'doc-2', user_uuid: 'user-2' },
      ];

      const expected = [
        { documentId: 'doc-1', userUuid: 'user-1' },
        { documentId: 'doc-2', userUuid: 'user-2' },
      ];

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle null and undefined', () => {
      expect(keysToCamel(null)).toBe(null);
      expect(keysToCamel(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(keysToCamel('string')).toBe('string');
      expect(keysToCamel(123)).toBe(123);
      expect(keysToCamel(true)).toBe(true);
    });
  });

  describe('keysToSnake', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        documentId: 'doc-123',
        userUuid: 'user-456',
        originalFilename: 'test.pdf',
      };

      const expected = {
        document_id: 'doc-123',
        user_uuid: 'user-456',
        original_filename: 'test.pdf',
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        documentInfo: {
          fileName: 'test.pdf',
          fileSize: 1024,
        },
        userData: {
          userId: 'user-123',
        },
      };

      const expected = {
        document_info: {
          file_name: 'test.pdf',
          file_size: 1024,
        },
        user_data: {
          user_id: 'user-123',
        },
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { documentId: 'doc-1', userUuid: 'user-1' },
        { documentId: 'doc-2', userUuid: 'user-2' },
      ];

      const expected = [
        { document_id: 'doc-1', user_uuid: 'user-1' },
        { document_id: 'doc-2', user_uuid: 'user-2' },
      ];

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('should handle null and undefined', () => {
      expect(keysToSnake(null)).toBe(null);
      expect(keysToSnake(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(keysToSnake('string')).toBe('string');
      expect(keysToSnake(123)).toBe(123);
      expect(keysToSnake(true)).toBe(true);
    });
  });

  describe('filterUndefined', () => {
    it('should remove undefined values', () => {
      const input = {
        field1: 'value1',
        field2: undefined,
        field3: 'value3',
        field4: undefined,
      };

      const expected = {
        field1: 'value1',
        field3: 'value3',
      };

      expect(filterUndefined(input)).toEqual(expected);
    });

    it('should keep null values', () => {
      const input = {
        field1: 'value1',
        field2: null,
        field3: undefined,
      };

      const expected = {
        field1: 'value1',
        field2: null,
      };

      expect(filterUndefined(input)).toEqual(expected);
    });

    it('should keep falsy values except undefined', () => {
      const input = {
        field1: 0,
        field2: false,
        field3: '',
        field4: undefined,
      };

      const expected = {
        field1: 0,
        field2: false,
        field3: '',
      };

      expect(filterUndefined(input)).toEqual(expected);
    });

    it('should handle empty objects', () => {
      expect(filterUndefined({})).toEqual({});
    });
  });
});
