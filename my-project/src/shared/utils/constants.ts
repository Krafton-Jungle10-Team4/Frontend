/**
 * Application-wide constants
 */

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.txt', '.md', '.docx'],
} as const;

export const TEXT_LIMITS = {
  BOT_NAME: 50,
  CUSTOM_GOAL: 1500,
  PERSONALITY: 3000,
  KNOWLEDGE: 10000,
} as const;

export const BOT_LIMITS = {
  MAX_BOTS: 5,
} as const;

export const POLLING = {
  TRAINING_STATUS_INTERVAL: 1000, // 1 second
  TRAINING_TIMEOUT: 300000, // 5 minutes
} as const;

export const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://3.37.127.46';
