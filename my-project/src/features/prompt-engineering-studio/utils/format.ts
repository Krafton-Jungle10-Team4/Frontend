/**
 * 포맷팅 유틸리티 함수
 * 날짜, 숫자, 통화 등을 사용자 친화적인 형식으로 변환
 */

/**
 * Date 객체 또는 타임스탬프를 포맷된 날짜 문자열로 변환
 */
export function formatDate(
  date: Date | number | string,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short',
  locale: string = 'ko-KR'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '-';
  }

  try {
    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(dateObj);

      case 'long':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj);

      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(dateObj);

      case 'datetime':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(dateObj);

      default:
        return dateObj.toISOString();
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
}

/**
 * 숫자를 천 단위로 구분하여 포맷
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * 테스트 결과 제목 포맷
 */
export function formatTestResultTitle(
  testSetId: string,
  modelName: string
): string {
  return `${testSetId}-${modelName}`;
}
