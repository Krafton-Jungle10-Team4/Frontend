import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { Award, Star, Zap, DollarSign, Bot } from 'lucide-react';
import { getModelColor } from '@shared/utils/styleUtils';
import type { ModelResult } from '@/features/prompt-engineering-studio/types/api';

interface WinnerQAViewerProps {
  winnerResult: ModelResult;
  onUseInWorkflow: () => void;
}

const MetricDisplay = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center text-sm">
        <Icon className="size-4 mr-2 text-white/70" />
        <span className="text-white/80 mr-2">{label}:</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

export function WinnerQAViewer({ winnerResult, onUseInWorkflow }: WinnerQAViewerProps) {
  const { modelName, quality, performance, responses } = winnerResult;
  const modelColor = getModelColor(modelName);

  return (
    <Card
      className="border transition-all duration-500"
      style={{
        borderColor: modelColor,
        boxShadow: `0 8px 32px 0 ${modelColor}30`,
        backgroundColor: `${modelColor}20`, // Set background color with ~12% opacity
      }}
    >
      <CardHeader 
        className="flex flex-row items-center justify-between pb-4 bg-black/20"
      >
        <div className="flex items-center gap-3">
            <Award className="size-8 text-amber-400" />
            <div>
                <CardTitle className="text-2xl text-white">{modelName}</CardTitle>
                <p className="text-sm text-white/80">WINNER MODEL</p>
            </div>
        </div>
        <Button onClick={onUseInWorkflow} className="bg-white text-black hover:bg-gray-200">
          <Bot className="size-4 mr-2" />
          워크플로우에 적용
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/10">
            <MetricDisplay icon={Star} label="종합 점수" value={quality?.totalScore || 'N/A'} />
            <MetricDisplay icon={Zap} label="평균 응답 시간" value={`${performance?.avgResponseTime?.toFixed(2) || 'N/A'}초`} />
            <MetricDisplay icon={DollarSign} label="총 비용" value={`$${performance?.totalCost?.toFixed(4) || '0'}`} />
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
          {(responses ?? []).map((res, index) => (
            <div key={index} className="space-y-3">
              <h4 className="font-semibold text-white">질문 {index + 1}: {res.question}</h4>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/90 whitespace-pre-wrap">{res.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
