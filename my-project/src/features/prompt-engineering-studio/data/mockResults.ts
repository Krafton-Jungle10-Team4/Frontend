import { TestResult, ComparisonData, ResponseExample, EvaluationMetric } from '../types/results';

export const mockWinner = {
  name: 'GPT-4-Turbo-Prompt-A',
  overallScore: 95,
  responseTime: 1.2,
  cost: '$0.05',
  promptTemplate: `You are a helpful assistant.
  - Your name is SnapBot.
  - You must answer in Korean.`,
};

export const mockTestResults: TestResult[] = [
  {
    id: 'test-1',
    testSetId: 'TS-001',
    prompt: '고객 지원 응답',
    model: 'GPT-4-Turbo',
    overallScore: 95,
    qualityScore: 98,
    speedScore: 92,
    costScore: 90,
    avgResponseTime: 1.2,
    totalCost: 0.05,
    userSatisfaction: 4.8,
    promptTemplate: 'You are a helpful assistant for customer support.',
    questions: [
      { id: 'q-1', question: '배송은 얼마나 걸리나요?', answer: '영업일 기준 3-5일 소요됩니다.', rating: 5 },
      { id: 'q-2', question: '환불 정책이 궁금합니다.', answer: '구매 후 7일 이내에 가능합니다.', rating: 4.8 },
    ],
  },
  {
    id: 'test-2',
    testSetId: 'TS-001',
    prompt: '고객 지원 응답',
    model: 'Claude 3 Opus',
    overallScore: 92,
    qualityScore: 95,
    speedScore: 95,
    costScore: 88,
    avgResponseTime: 1.0,
    totalCost: 0.06,
    userSatisfaction: 4.7,
    promptTemplate: 'You are a friendly customer service AI.',
    questions: [
      { id: 'q-1', question: '배송은 얼마나 걸리나요?', answer: '보통 3일에서 5일 정도 걸립니다.', rating: 4.9 },
      { id: 'q-2', question: '환불 정책이 궁금합니다.', answer: '7일 안에만 말씀해주시면 환불 가능합니다!', rating: 4.7 },
    ],
  },
  {
    id: 'test-3',
    testSetId: 'TS-001',
    prompt: '고객 지원 응답',
    model: 'Gemini Pro',
    overallScore: 88,
    qualityScore: 90,
    speedScore: 91,
    costScore: 94,
    avgResponseTime: 1.3,
    totalCost: 0.04,
    userSatisfaction: 4.5,
    promptTemplate: 'Assist the user with their customer support query.',
    questions: [
      { id: 'q-1', question: '배송은 얼마나 걸리나요?', answer: '배송 기간은 3-5일입니다.', rating: 4.5 },
      { id: 'q-2', question: '환불 정책이 궁금합니다.', answer: '환불은 7일 내로 가능합니다.', rating: 4.6 },
    ],
  },
  {
    id: 'test-4',
    testSetId: 'TS-001',
    prompt: '고객 지원 응답',
    model: 'GPT-4o',
    overallScore: 96,
    qualityScore: 97,
    speedScore: 98,
    costScore: 85,
    avgResponseTime: 0.9,
    totalCost: 0.07,
    userSatisfaction: 4.9,
    promptTemplate: 'You are the latest AI assistant from OpenAI.',
    questions: [
      { id: 'q-1', question: '배송은 얼마나 걸리나요?', answer: '배송은 평균적으로 3-5 영업일이 소요됩니다. 더 빠른 배송 옵션도 있습니다.', rating: 5 },
      { id: 'q-2', question: '환불 정책이 궁금합니다.', answer: '구입일로부터 7일 이내에 미사용 제품에 한해 전액 환불이 가능합니다.', rating: 4.9 },
    ],
  },
  {
    id: 'test-5',
    testSetId: 'TS-001',
    prompt: '고객 지원 응답',
    model: 'Claude 3 Sonnet',
    overallScore: 90,
    qualityScore: 92,
    speedScore: 93,
    costScore: 91,
    avgResponseTime: 1.1,
    totalCost: 0.05,
    userSatisfaction: 4.6,
    promptTemplate: 'I am Claude, a large language model from Anthropic.',
    questions: [
      { id: 'q-1', question: '배송은 얼마나 걸리나요?', answer: '안녕하세요! 배송은 보통 3일에서 5일 사이입니다.', rating: 4.8 },
      { id: 'q-2', question: '환불 정책이 궁금합니다.', answer: '네, 환불은 구매 후 7일 안에 신청해주시면 됩니다.', rating: 4.7 },
    ],
  },
];

export const mockComparisonData: ComparisonData[] = [];
export const mockResponseExamples: ResponseExample[] = [];

export const mockEvaluationMetrics: EvaluationMetric[] = [
  { name: '관련성', score: 94, status: 'excellent', color: '#10b981' },
  { name: '정확성', score: 92, status: 'excellent', color: '#10b981' },
  { name: '일관성', score: 90, status: 'excellent', color: '#10b981' },
  { name: '완전성', score: 88, status: 'good', color: '#f59e0b' },
];

export const mockEvaluationInsights = {};