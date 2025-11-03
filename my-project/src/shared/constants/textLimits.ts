/**
 * Text input limits for various fields
 */

export const TEXT_LIMITS = {
  BOT_NAME: {
    MIN: 1,
    MAX: 50,
  },
  BOT_DESCRIPTION: {
    MIN: 0,
    MAX: 200,
  },
  BOT_GOAL: {
    MIN: 10,
    MAX: 500,
  },
  BOT_PERSONALITY: {
    MIN: 20,
    MAX: 1000,
  },
  KNOWLEDGE_TEXT: {
    MIN: 0,
    MAX: 10000,
  },
  WEBSITE_URL: {
    MIN: 0,
    MAX: 500,
  },
} as const;

export type TextLimitKey = keyof typeof TEXT_LIMITS;
