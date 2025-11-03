/**
 * 문자열 유틸리티 함수
 */

/**
 * 문자열의 첫 글자를 대문자로 변환
 * @param str - 변환할 문자열
 * @returns 첫 글자가 대문자인 문자열
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 문자열을 특정 길이로 자르고 말줄임표 추가
 * @param str - 자를 문자열
 * @param maxLength - 최대 길이
 * @returns 잘린 문자열
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
