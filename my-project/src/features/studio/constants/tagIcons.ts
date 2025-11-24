import {
  Headphones,
  Megaphone,
  BarChart3,
  FileText,
  Folder,
  Bot,
  type LucideIcon,
} from 'lucide-react';

export const DEFAULT_TAGS = [
  '고객지원',
  '마케팅',
  '데이터분석',
  '문서작성',
  '기타',
] as const;

export type DefaultTag = (typeof DEFAULT_TAGS)[number];

export const TAG_ICON_MAP: Record<DefaultTag, LucideIcon> = {
  고객지원: Headphones,
  마케팅: Megaphone,
  데이터분석: BarChart3,
  문서작성: FileText,
  기타: Folder,
};

export const TAG_BACKGROUND_MAP: Record<DefaultTag, string> = {
  고객지원: '#CCFBF1',
  마케팅: '#EDE9FE',
  데이터분석: '#DBEAFE',
  문서작성: '#FEF3C7',
  기타: '#F3F4F6',
};

export const TAG_ICON_COLOR_MAP: Record<DefaultTag, string> = {
  고객지원: '#0D9488',
  마케팅: '#7C3AED',
  데이터분석: '#2563EB',
  문서작성: '#D97706',
  기타: '#6B7280',
};

export const DEFAULT_ICON = Bot;
export const DEFAULT_BACKGROUND = '#FCE7F3';
export const DEFAULT_ICON_COLOR = '#DB2777';

export function getWorkflowIcon(tags: string[] | undefined): LucideIcon {
  if (!tags || tags.length === 0) return DEFAULT_ICON;

  for (const tag of tags) {
    if (tag in TAG_ICON_MAP) {
      return TAG_ICON_MAP[tag as DefaultTag];
    }
  }

  return DEFAULT_ICON;
}

export function getWorkflowIconBackground(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return DEFAULT_BACKGROUND;

  for (const tag of tags) {
    if (tag in TAG_BACKGROUND_MAP) {
      return TAG_BACKGROUND_MAP[tag as DefaultTag];
    }
  }

  return DEFAULT_BACKGROUND;
}

export function getWorkflowIconColor(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return DEFAULT_ICON_COLOR;

  for (const tag of tags) {
    if (tag in TAG_ICON_COLOR_MAP) {
      return TAG_ICON_COLOR_MAP[tag as DefaultTag];
    }
  }

  return DEFAULT_ICON_COLOR;
}
