/**
 * WidgetCustomizer Component
 * 위젯 스타일 커스터마이징 UI
 */

import { Label } from '@shared/components/label';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Separator } from '@shared/components/separator';
import type { WidgetConfig } from '../types/deployment';
import { cn } from '@shared/components/utils';
import {
  LayoutBottomRight,
  LayoutBottomLeft,
  LayoutTopRight,
  LayoutTopLeft,
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
        <h3 className="text-sm font-semibold text-gray-900">기본 설정</h3>

        {/* 테마 선택 */}
        <div className="space-y-2">
          <Label htmlFor="theme">테마</Label>
          <Select
            value={value.theme || 'light'}
            onValueChange={(theme: 'light' | 'dark' | 'auto') =>
              updateConfig({ theme })
            }
          >
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">밝은 테마</SelectItem>
              <SelectItem value="dark">어두운 테마</SelectItem>
              <SelectItem value="auto">시스템 설정 따라가기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 위치 선택 */}
        <div className="space-y-2">
          <Label>위치</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'top-right', label: '우측 상단', Icon: LayoutTopRight },
              { value: 'top-left', label: '좌측 상단', Icon: LayoutTopLeft },
              { value: 'bottom-right', label: '우측 하단', Icon: LayoutBottomRight },
              { value: 'bottom-left', label: '좌측 하단', Icon: LayoutBottomLeft },
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
                      | 'top-right'
                      | 'top-left',
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

        {/* 주요 색상 */}
        <div className="space-y-2">
          <Label htmlFor="primary-color">주요 색상</Label>
          <div className="flex gap-2">
            <div className="relative">
              <Input
                id="primary-color"
                type="color"
                value={value.primary_color || '#0066FF'}
                onChange={(e) => updateConfig({ primary_color: e.target.value })}
                className="w-20 h-10 p-1 cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={value.primary_color || '#0066FF'}
              onChange={(e) => updateConfig({ primary_color: e.target.value })}
              placeholder="#0066FF"
              className="flex-1"
            />
          </div>
        </div>

        {/* 봇 이름 */}
        <div className="space-y-2">
          <Label htmlFor="bot-name">봇 이름</Label>
          <Input
            id="bot-name"
            type="text"
            value={value.bot_name || ''}
            onChange={(e) => updateConfig({ bot_name: e.target.value })}
            placeholder="AI Assistant"
          />
        </div>
      </section>

      <Separator />

      {/* 메시지 설정 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">메시지 설정</h3>

        <div className="space-y-2">
          <Label htmlFor="welcome-message">환영 메시지</Label>
          <Textarea
            id="welcome-message"
            value={value.welcome_message || ''}
            onChange={(e) => updateConfig({ welcome_message: e.target.value })}
            placeholder="안녕하세요! 무엇을 도와드릴까요?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeholder-text">입력 플레이스홀더</Label>
          <Input
            id="placeholder-text"
            type="text"
            value={value.placeholder_text || ''}
            onChange={(e) => updateConfig({ placeholder_text: e.target.value })}
            placeholder="메시지를 입력하세요..."
          />
        </div>
      </section>
    </div>
  );
}
