/**
 * AdvancedSettings Component
 * 고급 프롬프트 설정
 */

import { Card } from '@/shared/components/card';
import { Input } from '@/shared/components/input';
import { Slider } from '@/shared/components/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import { Settings, ChevronDown, Info } from 'lucide-react';
import { AdvancedSettingsProps } from '@/features/prompt-engineering-studio/types/prompt';

export function AdvancedSettings({
  isOpen,
  onOpenChange,
  temperature,
  onTemperatureChange,
  topP,
  onTopPChange,
  maxTokens,
  onMaxTokensChange,
  stopSequences,
  onStopSequencesChange,
}: AdvancedSettingsProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="text-white">고급 설정</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-white/60 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6 space-y-6">
          <TooltipProvider>
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm text-white">창의성 (Temperature)</label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-white/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>답변의 창의성 수준을 조절합니다. (0.0: 더 정확함 / 2.0: 더 창의적임)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-white font-mono">{temperature[0].toFixed(1)}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={onTemperatureChange}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm text-white">최대 답변 길이 (Max Tokens)</label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-white/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI가 생성하는 답변의 최대 길이를 제한합니다. (비용 관리에도 유용합니다.)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                placeholder="자동"
                value={maxTokens ?? ''}
                onChange={(e) => onMaxTokensChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Top P */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm text-white">Top P (샘플링)</label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-white/50" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>'창의성'과 유사하게 답변의 다양성을 조절합니다. (고급 설정: '창의성'과 함께 사용하지 않는 것을 권장합니다.)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-white font-mono">{topP[0].toFixed(1)}</span>
              </div>
              <Slider
                value={topP}
                onValueChange={onTopPChange}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Stop Sequences */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm text-white">중단 단어 (Stop Sequences)</label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-white/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI가 특정 단어(예: '종료:')를 생성하면, 그 즉시 답변을 멈추도록 설정합니다.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                placeholder="쉼표로 구분하여 입력..."
                value={stopSequences}
                onChange={(e) => onStopSequencesChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </TooltipProvider>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
