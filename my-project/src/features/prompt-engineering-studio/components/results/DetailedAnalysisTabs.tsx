
/**
 * DetailedAnalysisTabs Component
 * 상세 분석 탭 (비교 분석, 응답 결과, 품질 평가)
 */

import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/tabs';
import {
  BarChart3,
  MessageSquare,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DetailedAnalysisTabsProps } from '@features/prompt-engineering-studio/types/results';
import { formatTestResultTitle } from '@shared/utils';
import { getModelColor } from '@shared/utils/styleUtils';
import { memo, useMemo, useCallback } from 'react';

const getScoreColor = (score: number) => {
  if (score >= 95) return 'bg-emerald-600';
  if (score >= 90) return 'bg-sky-600';
  if (score < 85) return 'bg-rose-700';
  return 'bg-slate-500';
};

export const DetailedAnalysisTabs = memo(function DetailedAnalysisTabs({
  allTests = [],
  selectedTest,
  visibleModelIds = [],
}: DetailedAnalysisTabsProps) {
  const comparisonData = useMemo(() => [
    {
      metric: '품질',
      ...allTests.reduce((acc, test) => {
        acc[test.model] = test.qualityScore;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: '속도',
      ...allTests.reduce((acc, test) => {
        acc[test.model] = test.speedScore;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: '비용',
      ...allTests.reduce((acc, test) => {
        acc[test.model] = test.costScore;
        return acc;
      }, {} as Record<string, number>),
    },
  ], [allTests]);

  const responseTimeData = useMemo(() => allTests.map((test) => ({
    name: test.model,
    '응답시간(초)': test.avgResponseTime,
    id: test.id,
  })), [allTests]);

  const costData = useMemo(() => allTests.map((test) => ({
    name: test.model,
    '비용($)': test.totalCost,
    id: test.id,
  })), [allTests]);

  const getOpacity = useCallback((id: string) => {
    if (selectedTest) {
      return selectedTest.id === id ? 1 : 0.3;
    }
    return visibleModelIds.includes(id) ? 1 : 0.3;
  }, [selectedTest, visibleModelIds]);

  return (
    <Tabs defaultValue="comparison" className="w-full">
      <TabsList className="bg-black/20 border border-white/10 p-1">
        <TabsTrigger
          value="comparison"
          className="text-white data-[state=inactive]:text-white/70 data-[state=active]:bg-teal-500/20"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          비교 분석
        </TabsTrigger>
        <TabsTrigger
          value="responses"
          className="text-white data-[state=inactive]:text-white/70 data-[state=active]:bg-teal-500/20"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          응답 결과
        </TabsTrigger>
        <TabsTrigger
          value="evaluation"
          className="text-white data-[state=inactive]:text-white/70 data-[state=active]:bg-teal-500/20"
        >
          <Target className="w-4 h-4 mr-2" />
          품질 평가
        </TabsTrigger>
      </TabsList>

      {/* Comparison Tab */}
      <TabsContent value="comparison" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
            <h3 className="text-white mb-4 text-sm">성능 지표 비교</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="metric" stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {allTests.map((test) => (
                  <Bar
                    key={test.id}
                    dataKey={test.model}
                    fill={getModelColor(test.model)}
                    radius={[8, 8, 0, 0]}
                    fillOpacity={getOpacity(test.id)}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
            <h3 className="text-white mb-4 text-sm">응답시간 비교 (초)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="응답시간(초)" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {responseTimeData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getModelColor(entry.name)}
                      fillOpacity={getOpacity(entry.id)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
            <h3 className="text-white mb-4 text-sm">비용 비교 ($)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ffffff60" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, '비용']}
                />
                <Bar dataKey="비용($)" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {costData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getModelColor(entry.name)}
                      fillOpacity={getOpacity(entry.id)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </TabsContent>

      {/* Response Results Tab */}
      <TabsContent value="responses" className="space-y-4 mt-6">
        {selectedTest ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white text-lg">
                  {formatTestResultTitle(selectedTest.testSetId, selectedTest.model)} - 응답 결과
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {selectedTest.questions.length}개의 테스트 질문
                </p>
              </div>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                {selectedTest.model}
              </Badge>
            </div>

            {selectedTest.questions.map((example, index) => (
              <Card
                key={example.id}
                className="bg-black/20 backdrop-blur-md border border-white/20 p-6"
              >
                <div className="mb-4">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    질문 {index + 1}
                  </Badge>
                  <p className="text-white font-medium mt-2">{example.question}</p>
                </div>

                <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="text-sm text-teal-300 font-medium">AI 응답</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{example.answer}</p>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">테스트를 선택해주세요</h3>
              <p className="text-white/60 text-sm">
                응답 결과를 보려면 상단에서 테스트 카드를 클릭하세요.
              </p>
            </div>
          </Card>
        )}
      </TabsContent>

      {/* Evaluation Tab */}
      <TabsContent value="evaluation" className="space-y-4 mt-6">
        {selectedTest ? (
          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white mb-1">AI 기반 품질 평가</h3>
                <p className="text-sm text-white/60">
                  GPT-4를 평가자로 사용한 자동 점수
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">품질 점수</span>
                <Badge variant="outline" className="text-lg font-bold border-teal-400 text-teal-400">
                  {selectedTest.qualityScore.toFixed(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {selectedTest.evaluationMetrics?.map((metric) => (
                <div key={metric.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">{metric.name}</span>
                    <span className="text-sm font-semibold text-white">{metric.score}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-700 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white text-sm mb-3">평가 근거</h4>
              <p className="text-xs text-white/80">
                {selectedTest.evaluationReason}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-12">
            <div className="text-center">
              <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">테스트를 선택해주세요</h3>
              <p className="text-white/60 text-sm">
                품질 평가를 보려면 상단에서 테스트 카드를 클릭하세요.
              </p>
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
});
