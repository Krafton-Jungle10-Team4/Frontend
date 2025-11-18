import { useState, useEffect, useMemo } from 'react';
import { resultsApi } from '../api/resultsApi';
import { TestResult } from '../types/results';
import {
  mockComparisonData,
  mockResponseExamples,
  mockEvaluationMetrics,
  mockWinner,
  mockEvaluationInsights,
} from '@features/prompt-engineering-studio/data/mockResults';
import { sortTestsByOverallScore, getTopTests, findWinnerTest } from '@shared/utils';

export function useTestResults(testSetId: string | undefined) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [persona, setPersona] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (testSetId) {
        const data = await resultsApi.getTestResults(testSetId);
        if (data && data.length > 0) {
          setPersona(data[0].persona); // Assuming persona is in the first result
        }
        const dataWithProvider = data.map(result => {
          const modelName = result.model.toLowerCase();
          let provider = 'Unknown';
          if (modelName.includes('gpt')) {
            provider = 'OpenAI';
          } else if (modelName.includes('gemini')) {
            provider = 'Google';
          } else if (modelName.includes('claude')) {
            provider = 'Anthropic';
          }

          // Mock detailed evaluation metrics
          const detailedMetrics = [
            { name: '정확성', score: Math.floor(Math.random() * 10) + 90 },
            { name: '관련성', score: Math.floor(Math.random() * 10) + 90 },
            { name: '완전성', score: Math.floor(Math.random() * 15) + 85 },
            { name: '일관성', score: Math.floor(Math.random() * 15) + 85 },
            { name: '톤 & 스타일', score: Math.floor(Math.random() * 10) + 90 },
          ];

          const qualityScore = detailedMetrics.reduce((acc, metric) => acc + metric.score, 0) / detailedMetrics.length;

          return {
            ...result,
            provider,
            qualityScore,
            evaluationMetrics: detailedMetrics,
            evaluationReason: '전반적으로 우수한 답변이나, 일부 답변에서 최신 정보가 누락되어 완전성 점수가 다소 낮게 평가되었습니다.',
          };
        });
        setTestResults(dataWithProvider);
      }
    };
    fetchData();
  }, [testSetId]);

  const sortedResults = useMemo(() => sortTestsByOverallScore(testResults), [testResults]);
  const topThreeTests = useMemo(() => getTopTests(sortedResults, 3), [sortedResults]);
  const winnerTest = useMemo(() => findWinnerTest(sortedResults), [sortedResults]);

  const winner = useMemo(() => (winnerTest
    ? {
        name: winnerTest.testSetId
          ? `${winnerTest.testSetId}-${winnerTest.model}`
          : winnerTest.prompt,
        overallScore: winnerTest.overallScore,
        responseTime: winnerTest.avgResponseTime,
        cost: `$${winnerTest.totalCost.toFixed(2)}`,
        promptTemplate: winnerTest.promptTemplate,
      }
    : mockWinner), [winnerTest]);


  return {
    testResults: sortedResults,
    topThreeTests,
    comparisonData: mockComparisonData,
    responseExamples: mockResponseExamples,
    evaluationMetrics: mockEvaluationMetrics,
    winner,
    evaluationInsights: mockEvaluationInsights,
    persona,
  };
}
