/**
 * Case Conversion Utilities
 * snake_case ↔ camelCase conversion for API normalization
 */

/**
 * Convert snake_case string to camelCase
 * @example snakeToCamel('user_uuid') // 'userUuid'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 * @example camelToSnake('userUuid') // 'user_uuid'
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert object keys from snake_case to camelCase recursively
 * @param obj Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function keysToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = keysToCamel(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}

/**
 * Convert object keys from camelCase to snake_case recursively
 * @param obj Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function keysToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = keysToSnake(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}

/**
 * Filter out undefined values from an object
 * @param obj Object to filter
 * @returns Object with undefined values removed
 */
export function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as any);
}
