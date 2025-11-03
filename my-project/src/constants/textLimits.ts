/**
 * Text Input Limits
 * 텍스트 입력 필드의 최대 길이 제한
 */

export const TEXT_LIMITS = {
  // Bot Setup
  BOT_NAME: 50,
  BOT_DESCRIPTION: 200,
  BOT_GOAL: 500,
  BOT_PERSONALITY: 1000,

  // Knowledge Base
  WEBSITE_URL: 500,
  FILE_NAME: 255,

  // Chat
  MESSAGE: 2000,

  // General
  TITLE: 100,
  SHORT_TEXT: 255,
  LONG_TEXT: 1000,
} as const;

export type TextLimitKey = keyof typeof TEXT_LIMITS;
