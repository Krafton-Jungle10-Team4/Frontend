// src/shared/constants/workflow/portTypes.ts

import { PortType } from '@shared/types/workflow/port.types';

/**
 * 포트 타입 메타데이터
 */
export const PORT_TYPE_META = {
  [PortType.STRING]: {
    label: '문자열',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    icon: 'RiTextIcon',
  },
  [PortType.NUMBER]: {
    label: '숫자',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    icon: 'RiHashtagIcon',
  },
  [PortType.BOOLEAN]: {
    label: '참/거짓',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    icon: 'RiToggleIcon',
  },
  [PortType.ARRAY]: {
    label: '배열',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    icon: 'RiListIcon',
  },
  [PortType.ARRAY_FILE]: {
    label: '파일 배열',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    icon: 'RiFolderImageLine',
  },
  [PortType.OBJECT]: {
    label: '객체',
    color: 'text-pink-500',
    bgColor: 'bg-pink-100',
    icon: 'RiBracesIcon',
  },
  [PortType.FILE]: {
    label: '파일',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: 'RiFileIcon',
  },
  [PortType.ANY]: {
    label: '모든 타입',
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
    icon: 'RiAsteriskIcon',
  },
} as const;

/**
 * 타입별 기본값
 */
export const PORT_TYPE_DEFAULTS: Record<PortType, unknown> = {
  [PortType.STRING]: '',
  [PortType.NUMBER]: 0,
  [PortType.BOOLEAN]: false,
  [PortType.ARRAY]: [],
  [PortType.ARRAY_FILE]: [],
  [PortType.OBJECT]: {},
  [PortType.FILE]: null,
  [PortType.ANY]: null,
};

export const isPortTypeCompatible = (
  source?: PortType,
  target?: PortType
) => {
  if (!source || !target) {
    return false;
  }
  if (source === target) {
    return true;
  }
  return source === PortType.ANY || target === PortType.ANY;
};
