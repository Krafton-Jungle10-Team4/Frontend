/**
 * WidgetCustomizer Component
 * 위젯 스타일 커스터마이징 UI
 */

import type { WidgetConfig } from '../types/deployment';
import { cn } from '@shared/components/utils';
import {
  LayoutBottomRight,
  LayoutBottomLeft,
  LayoutBottomCenter,
} from '@/shared/icons/layout-icons';

interface WidgetCustomizerProps {
  value: WidgetConfig;
  onChange: (config: WidgetConfig) => void;
}

export function WidgetCustomizer({ value, onChange }: WidgetCustomizerProps) {
  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onChange({ ...value, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* 기본 설정 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">토글 위치 설정</h3>

        {/* 위치 선택 */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'bottom-right', label: '우측 하단', Icon: LayoutBottomRight },
              { value: 'bottom-left', label: '좌측 하단', Icon: LayoutBottomLeft },
              { value: 'bottom-center', label: '중앙 하단', Icon: LayoutBottomCenter },
            ].map(({ value: pos, label, Icon }) => (
              <button
                key={pos}
                type="button"
                className={cn(
                  'p-3 border-2 rounded-lg transition-all hover:border-blue-400',
                  value.position === pos
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
                onClick={() =>
                  updateConfig({
                    position: pos as
                      | 'bottom-right'
                      | 'bottom-left'
                      | 'bottom-center',
                  })
                }
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
