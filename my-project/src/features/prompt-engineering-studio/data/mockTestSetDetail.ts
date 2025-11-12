/**
 * Mock data for a detailed test set view.
 * This data structure represents the result of a single, comprehensive test run
 * involving multiple personas, models, and questions.
 */
import type { TestSetDetailResponse } from '../types/api';

export const mockTestSetDetail: TestSetDetailResponse = {
  testSetId: 'TS-EXP-20251111-001',
  testSetName: '고객 지원 응답 품질 A/B 테스트',
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  status: 'completed',
  persona: `당신은 SnapAgent의 고객 지원 전문가입니다. 다음 원칙에 따라 고객의 질문에 답변해주세요.
1.  **정확성**: 제공된 지식 베이스를 기반으로 정확한 정보를 전달합니다.
2.  **친절함**: 항상 상냥하고 공감하는 어조를 유지합니다.
3.  **간결함**: 명확하고 이해하기 쉽게 답변을 구성합니다.`,
  testInputs: [
    '제품 배송이 지연되고 있는데, 언제쯤 받을 수 있나요?',
    '환불 절차와 정책에 대해 자세히 알려주세요.',
    '프리미엄 플랜의 주요 기능은 무엇인가요?',
  ],
  modelsTested: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro'],
  advancedSettings: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stop: [],
    seed: 42,
  },
  winnerModel: 'claude-3.5-sonnet',
  modelResults: [
    {
      modelName: 'gpt-4o',
      performance: {
        avgResponseTime: 1.8,
        totalCost: 0.0045,
      },
      quality: {
        totalScore: 92.5,
        metrics: [
          { name: '정확성', score: 95 },
          { name: '관련성', score: 98 },
          { name: '완전성', score: 90 },
          { name: '일관성', score: 92 },
          { name: '스타일', score: 90 },
        ],
        reasoning: '전반적으로 우수하지만, 일부 답변이 다소 장황합니다.',
      },
      responses: [
        {
          question: '제품 배송이 지연되고 있는데, 언제쯤 받을 수 있나요?',
          answer:
            '안녕하세요 고객님, 배송 지연으로 불편을 드려 죄송합니다. 주문하신 제품은 현재 물류 센터에서 출고되어, 약 2-3 영업일 내에 도착할 예정입니다. 자세한 사항은 배송 추적 링크를 확인해주세요.',
        },
        {
          question: '환불 절차와 정책에 대해 자세히 알려주세요.',
          answer:
            '환불은 제품 수령 후 7일 이내에 미사용 제품에 한해 가능합니다. 저희 웹사이트의 \'마이페이지 > 주문 내역\'에서 환불 신청을 접수해주시면, 저희가 확인 후 절차를 안내해드리겠습니다.',
        },
      ],
    },
    {
      modelName: 'claude-3.5-sonnet',
      performance: {
        avgResponseTime: 1.5,
        totalCost: 0.0032,
      },
      quality: {
        totalScore: 95.8,
        metrics: [
          { name: '정확성', score: 98 },
          { name: '관련성', score: 97 },
          { name: '완전성', score: 94 },
          { name: '일관성', score: 96 },
          { name: '스타일', score: 94 },
        ],
        reasoning:
          '가장 정확하고 간결하며, 친절한 톤을 일관되게 유지하여 고객 지원 페르소나에 가장 적합합니다.',
      },
      responses: [
        {
          question: '제품 배송이 지연되고 있는데, 언제쯤 받을 수 있나요?',
          answer:
            '배송 지연으로 불편을 드려 대단히 죄송합니다. 고객님의 주문은 현재 배송 중이며, 예상 도착일은 2일 뒤입니다. 조금만 더 기다려주시면 감사하겠습니다.',
        },
        {
          question: '환불 절차와 정책에 대해 자세히 알려주세요.',
          answer:
            '네, 환불 정책에 대해 안내해드리겠습니다. 제품을 받으신 날로부터 7일 안에 환불 신청이 가능하며, 제품은 사용하지 않은 상태여야 합니다. 홈페이지를 통해 간단히 접수하실 수 있습니다.',
        },
        {
          question: '프리미엄 플랜의 주요 기능은 무엇인가요?',
          answer:
            '프리미엄 플랜은 무제한 챗봇 생성, 전용 API 엔드포인트 제공, 그리고 우선 기술 지원 서비스를 포함하여 비즈니스 확장에 필요한 모든 기능을 제공합니다.',
        },
      ],
    },
    {
      modelName: 'gemini-1.5-pro',
      performance: {
        avgResponseTime: 2.1,
        totalCost: 0.0038,
      },
      quality: {
        totalScore: 89.0,
        metrics: [
          { name: '정확성', score: 92 },
          { name: '관련성', score: 95 },
          { name: '완전성', score: 88 },
          { name: '일관성', score: 85 },
          { name: '스타일', score: 85 },
        ],
        reasoning: '답변은 정확하지만, 어조가 다소 기계적이고 일관성이 부족합니다.',
      },
      responses: [
        {
          question: '제품 배송이 지연되고 있는데, 언제쯤 받을 수 있나요?',
          answer:
            '주문하신 제품의 배송이 지연되고 있습니다. 예상 수령일은 2-3일 후입니다.',
        },
        {
          question: '환불 절차와 정책에 대해 자세히 알려주세요.',
          answer:
            '환불 정책: 수령 후 7일 이내. 조건: 미사용. 절차: 웹사이트에서 신청.',
        },
      ],
    },
  ],
};
