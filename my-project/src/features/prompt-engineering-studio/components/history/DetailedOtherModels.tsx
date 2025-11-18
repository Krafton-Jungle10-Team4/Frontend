import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/accordion';
import { Button } from '@shared/components/button';
import { Star, Zap, DollarSign, ChevronRight } from 'lucide-react';
import type { ModelResult } from '@/features/prompt-engineering-studio/types/api';

interface DetailedOtherModelsProps {
  otherResults: ModelResult[];
  onNavigateToResults: () => void;
}

const MetricDisplay = ({ icon: Icon, label, value, unit = '' }: { icon: React.ElementType, label: string, value: string | number, unit?: string }) => (
  <div className="flex items-center text-sm text-white/80">
    <Icon className="size-4 mr-2 text-white/60" />
    <span className="w-20">{label}</span>
    <span className="font-semibold text-white">{value}</span>
    {unit && <span className="text-xs text-white/60 ml-1">{unit}</span>}
  </div>
);

const MiniBar = ({ value, maxValue = 100 }: { value: number, maxValue?: number }) => (
  <div className="w-24 h-2 bg-white/10 rounded-full">
    <div
      className="h-2 bg-teal-400 rounded-full"
      style={{ width: `${(value / maxValue) * 100}%` }}
    />
  </div>
);

export function DetailedOtherModels({ otherResults, onNavigateToResults }: DetailedOtherModelsProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {otherResults.map((result, index) => (
        <AccordionItem key={result.modelName} value={result.modelName} className="border-b-0">
          <AccordionTrigger className="bg-black/20 hover:bg-white/10 border border-white/20 rounded-lg p-4 data-[state=open]:rounded-b-none">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-white">{index + 2}. {result.modelName}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-amber-400" />
                  <span className="font-bold text-white">{result.quality?.totalScore || 'N/A'}</span>
                </div>
                <MiniBar value={result.quality?.totalScore || 0} />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-black/10 border border-t-0 border-white/20 rounded-b-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-md font-semibold mb-3 text-white">핵심 지표</h4>
                <div className="space-y-2">
                  <MetricDisplay icon={Star} label="품질 점수" value={result.quality?.metrics?.find(m => m.name === '품질')?.score || 'N/A'} />
                  <MetricDisplay icon={Zap} label="응답 시간" value={result.performance?.avgResponseTime?.toFixed(2) || 'N/A'} unit="초" />
                  <MetricDisplay icon={DollarSign} label="총 비용" value={`$${result.performance?.totalCost?.toFixed(4) || '0'}`} />
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-3 text-white">질문/응답 샘플</h4>
                {result.responses && result.responses.length > 0 ? (
                  <div className="bg-white/5 p-3 rounded-md space-y-2 text-xs">
                    <p className="font-semibold text-white/90 truncate">{result.responses[0].question}</p>
                    <p className="text-white/70 line-clamp-2">{result.responses[0].answer}</p>
                  </div>
                ) : <p className="text-sm text-white/60">데이터 없음</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={onNavigateToResults} className="bg-gray-600 hover:bg-gray-700 text-white">
                상세 비교 분석 페이지로 이동
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
