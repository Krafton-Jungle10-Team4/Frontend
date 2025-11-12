import type {
  PromptTemplate,
  TestSetResult,
} from '../types/prompt';
import { FileText, Sparkles, Wand2 } from 'lucide-react';

/**
 * Mock 프롬프트 템플릿
 */
export const mockTemplates: PromptTemplate[] = [
  {
    id: 'zero-shot',
    name: 'Zero-shot 기본',
    description: '예시 없이 직접 질문',
    icon: FileText,
    prompt:
      '당신은 전문적인 AI 어시스턴트입니다. 주어진 문서를 바탕으로 사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요.'
  },
  {
    id: 'few-shot',
    name: 'Few-shot 예시',
    description: '예시와 함께 학습',
    icon: Sparkles,
    prompt:
      '당신은 전문적인 AI 어시스턴트입니다. 다음 예시를 참고하여 답변하세요. 예시 1:질문: 제품 A의 가격은? 답변: 제품 A의 가격은 $99입니다. 예시 2:질문: 배송은 얼마나 걸리나요? 답변: 일반 배송은 3-5 영업일이 소요됩니다.',
  },
  {
    id: 'role-based',
    name: '역할 기반',
    description: '특정 역할 부여',
    icon: Wand2,
    prompt:
      '당신은 10년 경력의 고객 지원 전문가입니다. 친절하고 전문적인 태도로 고객의 문제를 해결해주세요.',
  },
];



/**
 * Mock 테스트 세트 목록
 */
export const mockTestSets: TestSetResult[] = [
  {
    testSetId: 'TEST-01',
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    promptTemplate: mockTemplates[0].prompt,
    questions: [
      { id: 'q1', value: '제품 배송이 지연되고 있습니다. 언제 받을 수 있나요?' },
      { id: 'q2', value: '환불 정책이 어떻게 되나요?' },
    ],
    selectedModels: ['gpt-4'],
    advancedSettings: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    },
    results: [
      {
        modelId: 'gpt-4',
        modelName: 'GPT-4',
        qualityScore: 85,
        speedScore: 78,
        costScore: 70,
        avgResponseTime: 1.8,
        totalCost: 0.45,
        userSatisfaction: 4.2,
      },
    ],
  },
  {
    testSetId: 'TEST-02',
    executedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    promptTemplate: mockTemplates[1].prompt,
    questions: [
      { id: 'q1', value: '제품 배송이 지연되고 있습니다. 언제 받을 수 있나요?' },
      { id: 'q2', value: '환불 정책이 어떻게 되나요?' },
      { id: 'q3', value: '제품의 보증 기간은 얼마나 되나요?' },
    ],
    selectedModels: ['gpt-4', 'claude-3'],
    advancedSettings: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    },
    results: [
      {
        modelId: 'gpt-4',
        modelName: 'GPT-4',
        qualityScore: 92,
        speedScore: 75,
        costScore: 68,
        avgResponseTime: 2.1,
        totalCost: 0.52,
        userSatisfaction: 4.7,
      },
      {
        modelId: 'claude-3',
        modelName: 'Claude-3',
        qualityScore: 88,
        speedScore: 82,
        costScore: 75,
        avgResponseTime: 1.6,
        totalCost: 0.38,
        userSatisfaction: 4.5,
      },
    ],
  },
  {
    testSetId: 'TEST-03',
    executedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    promptTemplate: mockTemplates[2].prompt,
    questions: [
      { id: 'q1', value: 'VIP 고객의 배송 지연 문의' },
      { id: 'q2', value: '프리미엄 멤버십 혜택 문의' },
    ],
    selectedModels: ['gpt-4', 'claude-3', 'gemini-pro', 'llama-2'],
    advancedSettings: {
      temperature: 0.8,
      maxTokens: 2500,
      topP: 0.95,
    },
    results: [
      {
        modelId: 'gpt-4',
        modelName: 'GPT-4',
        qualityScore: 94,
        speedScore: 73,
        costScore: 65,
        avgResponseTime: 2.3,
        totalCost: 0.58,
        userSatisfaction: 4.8,
      },
      {
        modelId: 'claude-3',
        modelName: 'Claude-3',
        qualityScore: 90,
        speedScore: 80,
        costScore: 72,
        avgResponseTime: 1.7,
        totalCost: 0.42,
        userSatisfaction: 4.6,
      },
      {
        modelId: 'gemini-pro',
        modelName: 'Gemini Pro',
        qualityScore: 87,
        speedScore: 85,
        costScore: 78,
        avgResponseTime: 1.4,
        totalCost: 0.35,
        userSatisfaction: 4.4,
      },
      {
        modelId: 'llama-2',
        modelName: 'Llama-2',
        qualityScore: 80,
        speedScore: 90,
        costScore: 88,
        avgResponseTime: 1.1,
        totalCost: 0.18,
        userSatisfaction: 4.0,
      },
    ],
  },
];
