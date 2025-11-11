import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { RefreshCw, Bot, FileText, Sliders, MessageSquare } from 'lucide-react';
import type { TestSetDetailResponse } from '@/features/prompt-engineering-studio/types/api';

interface HistorySummaryBoardProps {
  testSet: TestSetDetailResponse;
  onRestore: () => void;
}

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="size-4 text-white/70" />
      <h4 className="text-sm font-semibold text-white/90">{title}</h4>
    </div>
    <div className="p-3 bg-black/20 rounded-md text-xs text-white/80 space-y-2">
      {children}
    </div>
  </div>
);

export function HistorySummaryBoard({ testSet, onRestore }: HistorySummaryBoardProps) {
  const {
    testSetName,
    persona,
    questions,
    modelsTested,
    advancedSettings,
  } = testSet;

  const settings = advancedSettings || {};

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">{testSetName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="페르소나" icon={FileText}>
          <p className="whitespace-pre-wrap line-clamp-3">{persona}</p>
        </Section>

        <Section title="테스트 모델" icon={Bot}>
          <div className="flex flex-wrap gap-2">
            {(modelsTested ?? []).map(model => <Badge key={model} variant="secondary">{model}</Badge>)}
          </div>
        </Section>

        <Section title="테스트 질문" icon={MessageSquare}>
          <ul className="list-disc list-inside">
            {(questions ?? []).map((q, i) => <li key={i} className="truncate">{q}</li>)}
          </ul>
        </Section>

        <Section title="고급 설정" icon={Sliders}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Temperature:</span> <span className="font-mono">{settings.temperature ?? 'N/A'}</span>
            <span>Max Tokens:</span> <span className="font-mono">{settings.maxTokens ?? 'N/A'}</span>
            <span>Top P:</span> <span className="font-mono">{settings.topP ?? 'N/A'}</span>
            <span>Stop Sequences:</span> <span className="font-mono truncate">{settings.stop?.join(', ') || 'N/A'}</span>
          </div>
        </Section>

        <div className="pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full border-white/20 bg-black/20 hover:bg-white/10 text-white"
            onClick={onRestore}
          >
            <RefreshCw className="size-4 mr-2" />
            이 세트로 되돌리기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
