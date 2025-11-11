/**
 * Test Set Info Component
 * 테스트 세트 정보 (페르소나, 테스트 입력, 설정)
 */

import React from 'react';
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { ChevronDown, User, MessageSquare, Sliders } from 'lucide-react';
import type { TestSetDetailResponse } from '@/features/prompt-engineering-studio/types/api';

interface TestSetInfoProps {
  testSet: TestSetDetailResponse;
}

export function TestSetInfo({ testSet }: TestSetInfoProps) {
  const { persona, testInputs, advancedSettings } = testSet;
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">테스트 설정</h2>

      {/* 페르소나 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="size-4 text-gray-500" />
          <p className="font-medium">페르소나</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm">{persona}</p>
        </div>
      </div>

      {/* 테스트 입력 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="size-4 text-gray-500" />
          <p className="font-medium">테스트 질문</p>
          <Badge variant="secondary">{testInputs.length}개</Badge>
        </div>
        <div className="space-y-2">
          {testInputs.map((input, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Q{index + 1}:</span> {input}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 고급 설정 */}
      <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full">
          <Sliders className="size-4 text-gray-500" />
          <p className="font-medium">고급 설정</p>
          <ChevronDown
            className={`size-4 text-gray-500 transition-transform ${
              isSettingsOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="font-medium">{advancedSettings.temperature}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Tokens</p>
              <p className="font-medium">
                {advancedSettings.maxTokens ?? '자동'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Top P</p>
              <p className="font-medium">{advancedSettings.topP ?? 1.0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Frequency Penalty</p>
              <p className="font-medium">
                {advancedSettings.frequencyPenalty ?? 0.0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Presence Penalty</p>
              <p className="font-medium">
                {advancedSettings.presencePenalty ?? 0.0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Seed</p>
              <p className="font-medium">{advancedSettings.seed ?? '없음'}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
