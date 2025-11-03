/**
 * Formatting utility functions
 */

import type { Language } from '../App';

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatTimeAgo(date: Date, language: Language): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const translations = {
    en: {
      justNow: 'just now',
      minutes: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
      hours: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
      days: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
    },
    ko: {
      justNow: '방금 전',
      minutes: (n: number) => `${n}분 전`,
      hours: (n: number) => `${n}시간 전`,
      days: (n: number) => `${n}일 전`,
    },
  };

  const t = translations[language];

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minutes(diffMins);
  if (diffHours < 24) return t.hours(diffHours);
  return t.days(diffDays);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}
