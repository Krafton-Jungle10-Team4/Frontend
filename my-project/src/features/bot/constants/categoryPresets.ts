import type { LucideIcon } from 'lucide-react';
import {
  Headset,
  BadgeDollarSign,
  Megaphone,
  Gauge,
  Sparkles,
} from 'lucide-react';

export interface BotCategoryPreset {
  value: string;
  label: string;
  description: string;
  primary: string;
  secondary: string;
  muted: string;
}

export const BOT_CATEGORY_PRESETS: BotCategoryPreset[] = [
  {
    value: 'IT지원',
    label: 'IT 지원',
    description: '헬프데스크 · 기술 지원 · 내부 도구',
    primary: '#3735c3',
    secondary: '#5f5bff',
    muted: '#eef0ff',
  },
  {
    value: '세일즈',
    label: '세일즈',
    description: '리드 생성 · 아웃바운드 · CRM 알림',
    primary: '#f97316',
    secondary: '#f59e0b',
    muted: '#fff2e5',
  },
  {
    value: '마케팅',
    label: '마케팅',
    description: '캠페인 · 콘텐츠 · 리서치',
    primary: '#c158ff',
    secondary: '#6b5bff',
    muted: '#f7ecff',
  },
  {
    value: '운영',
    label: '운영',
    description: 'CS 자동화 · 운영 효율 · 품질 모니터링',
    primary: '#10b981',
    secondary: '#22d3ee',
    muted: '#e8fbf6',
  },
  {
    value: '기타',
    label: '기타',
    description: '분류되지 않은 기타 케이스',
    primary: '#475569',
    secondary: '#94a3b8',
    muted: '#e2e8f0',
  },
];

export const DEFAULT_CATEGORY_PRESET =
  BOT_CATEGORY_PRESETS.find((preset) => preset.value === '기타') ||
  BOT_CATEGORY_PRESETS[BOT_CATEGORY_PRESETS.length - 1];

const normalizeTag = (tag: string) => tag.trim().toLowerCase();

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'it지원': Headset,
  '세일즈': BadgeDollarSign,
  '마케팅': Megaphone,
  '운영': Gauge,
  '기타': Sparkles,
};

export function getCategoryPreset(tag?: string): BotCategoryPreset {
  if (!tag) {
    return DEFAULT_CATEGORY_PRESET;
  }

  const matched = BOT_CATEGORY_PRESETS.find(
    (preset) =>
      normalizeTag(preset.value) === normalizeTag(tag) ||
      normalizeTag(preset.label) === normalizeTag(tag)
  );

  if (matched) {
    return matched;
  }

  return {
    ...DEFAULT_CATEGORY_PRESET,
  };
}

export function getCategoryIcon(tag?: string): LucideIcon {
  const preset = getCategoryPreset(tag);
  const key = normalizeTag(preset.value);
  return CATEGORY_ICON_MAP[key] || Sparkles;
}
