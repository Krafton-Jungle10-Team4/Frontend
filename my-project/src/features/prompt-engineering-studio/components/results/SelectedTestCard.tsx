/**
 * SelectedTestCard Component
 * 사용자가 선택한 테스트 조합을 표시하는 카드
 */
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { TestResult } from '@features/prompt-engineering-studio/types/results';
import { FileText, BrainCircuit, Zap, Tag } from 'lucide-react';
import { getModelColor } from '@shared/utils/styleUtils';

interface SelectedTestCardProps {
  selectedTest: TestResult | undefined;
}

export function SelectedTestCard({ selectedTest }: SelectedTestCardProps) {
  const modelColor = selectedTest ? getModelColor(selectedTest.model) : '#1f2937';
  const cardStyle = selectedTest
    ? {
        backgroundColor: `${modelColor}33`, // Add ~20% opacity
        boxShadow: `0 10px 15px -3px ${modelColor}30, 0 4px 6px -4px ${modelColor}30`,
      }
    : {};

  return (
    <Card
      className="bg-gray-800/30 backdrop-blur-md border border-white/20 transition-all duration-500"
      style={cardStyle}
    >
      <CardHeader>
        <CardTitle className="text-white">
          {selectedTest ? '내가 선택한 조합' : '조합을 선택하세요'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedTest ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-white/80" />
              <Badge
                style={{
                  backgroundColor: `${modelColor}20`,
                  borderColor: `${modelColor}50`,
                  color: modelColor,
                }}
              >
                {selectedTest.model}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white">
                {selectedTest.promptTemplate
                  ? '커스텀 프롬프트'
                  : '기본 프롬프트'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white">
                {selectedTest.avgResponseTime}초 응답 속도
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white">
                ${selectedTest.totalCost.toFixed(4)}/요청 비용
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            좌측 카드에서 테스트 조합을 클릭하여 상세 정보를 확인하세요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
