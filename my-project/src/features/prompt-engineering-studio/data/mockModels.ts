import type { ModelConfig } from '../types/prompt';

/**
 * Mock AI 모델 설정
 * 웹 검색을 통해 수집된 2025년 11월 기준 데이터
 */
export const mockModels: ModelConfig[] = [
  // OpenAI
  {
    id: 'gpt-4o',
    provider: 'OpenAI',
    name: 'GPT-4o',
    price: '$5 / 1M input tokens',
    speed: 'Fast',
    quality: 'Highest',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'OpenAI',
    name: 'GPT-4o mini',
    price: '$0.15 / 1M input tokens',
    speed: 'Very Fast',
    quality: 'High',
  },
  // Google
  {
    id: 'gemini-1.5-pro',
    provider: 'Google',
    name: 'Gemini 1.5 Pro',
    price: '$7 / 1M input tokens',
    speed: 'Medium',
    quality: 'Highest',
  },
  {
    id: 'gemini-2.0-flash',
    provider: 'Google',
    name: 'Gemini 2.0 Flash',
    price: 'N/A (Check latest)',
    speed: 'Very Fast',
    quality: 'High',
  },
  // Anthropic
  {
    id: 'claude-3.5-sonnet',
    provider: 'Anthropic',
    name: 'Claude 3.5 Sonnet',
    price: '$3 / 1M input tokens',
    speed: 'Fast',
    quality: 'Highest',
  },
  {
    id: 'claude-3-haiku',
    provider: 'Anthropic',
    name: 'Claude 3 Haiku',
    price: '$0.25 / 1M input tokens',
    speed: 'Very Fast',
    quality: 'High',
  },
  {
    id: 'claude-3-opus',
    provider: 'Anthropic',
    name: 'Claude 3 Opus',
    price: '$15 / 1M input tokens',
    speed: 'Medium',
    quality: 'Superior',
  },
];
