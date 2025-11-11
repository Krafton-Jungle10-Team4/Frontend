import { TestSet } from '../types/testSet';

export const mockTestSets: TestSet[] = [
  {
    id: 'ts_001',
    name: 'Q4 마케팅 카피 테스트',
    createdAt: '2025-11-10',
    prompts: [
      {
        id: 'p_001',
        content: '전문적이고 설득력 있는 톤으로 AI 제품의 혁신적인 기능을 강조하는 광고 문구를 만들어주세요.',
        modelResults: [
          {
            model: 'gpt-4o',
            averageScore: 95.2,
            responses: [
              { id: 'res_001', question: '우리 제품의 핵심 장점은?', answer: '혁신적인 AI 기반 자동화로 팀 생산성을 30% 향상시킵니다. 반복 작업은 AI에게 맡기고 창의적인 업무에 집중하세요.', score: 98 },
              { id: 'res_002', question: '타겟 고객에게 어필할 문구는?', answer: '더 이상 반복 작업에 시간을 낭비하지 마세요. SnapAgent가 비즈니스를 위한 가장 스마트한 솔루션을 제공합니다.', score: 92 },
            ],
          },
          {
            id: 'mr_002',
            model: 'claude-3.5-sonnet',
            averageScore: 88.5,
            responses: [
              { id: 'res_003', question: '우리 제품의 핵심 장점은?', answer: 'AI 자동화 솔루션으로 업무 효율을 극대화하세요. 저희 제품은 뛰어난 성능과 안정성을 자랑합니다.', score: 89 },
              { id: 'res_004', question: '타겟 고객에게 어필할 문구는?', answer: '스마트한 AI 파트너와 함께 비즈니스를 한 단계 성장시키세요.', score: 88 },
            ],
          },
        ],
      },
      {
        id: 'p_002',
        content: '친근하고 유머러스한 톤으로 사용자에게 다가가는 광고 카피를 작성해줘.',
        modelResults: [
          {
            id: 'mr_003',
            model: 'gpt-4o',
            averageScore: 91.0,
            responses: [
              { id: 'res_005', question: '우리 제품의 핵심 장점은?', answer: '귀찮은 일은 AI에게 던져버리고 칼퇴하세요! SnapAgent가 여러분의 워라밸을 지켜드립니다.', score: 93 },
              { id: 'res_006', question: '타겟 고객에게 어필할 문구는?', answer: '커피 마실 시간도 없는 당신, SnapAgent가 대신 일해드립니다. 이제 당신은 넷플릭스 볼 시간 부자!', score: 89 },
            ],
          },
          {
            id: 'mr_004',
            model: 'claude-3.5-sonnet',
            averageScore: 92.8,
            responses: [
              { id: 'res_007', question: '우리 제품의 핵심 장점은?', answer: '우리 AI 비서, 일 잘하죠? 여러분의 업무를 덜어드리기 위해 태어났어요!', score: 94 },
              { id: 'res_008', question: '타겟 고객에게 어필할 문구는?', answer: '반복 업무 지옥에서 탈출하고 싶다면? SnapAgent가 구원해드립니다!', score: 91 },
            ],
          },
        ],
      },
    ],
    models: ['gpt-4o', 'claude-3.5-sonnet'],
    questions: ['우리 제품의 핵심 장점은?', '타겟 고객에게 어필할 문구는?'],
    winner: {
      promptContent: '전문적이고 설득력 있는 톤으로 AI 제품의 혁신적인 기능을 강조하는 광고 문구를 만들어주세요.',
      model: 'gpt-4o',
    },
    userSelection: {
      promptContent: '친근하고 유머러스한 톤으로 사용자에게 다가가는 광고 카피를 작성해줘.',
      model: 'claude-3.5-sonnet',
    },
  },
  {
    id: 'ts_002',
    name: '신제품 설명서 v2 테스트',
    createdAt: '2025-11-09',
    prompts: [
      {
        id: 'p_003',
        content: '새로운 기능인 "자동 리포팅"에 대해 사용자가 이해하기 쉽게 설명해줘.',
        modelResults: [
          {
            id: 'mr_005',
            model: 'GPT-4o',
            averageScore: 97.0,
            responses: [
              { id: 'res_009', question: '기능의 핵심 가치는?', answer: '매일 아침, 복잡한 데이터를 분석한 비즈니스 리포트가 당신의 메일함에 자동으로 도착합니다. 더 이상 수동으로 데이터를 취합하고 보고서를 작성할 필요가 없습니다.', score: 99 },
              { id: 'res_010', question: '사용자는 어떤 이점을 얻는가?', answer: '버튼 클릭 한 번으로 리포팅 설정을 완료하고, 매일 아침 중요한 비즈니스 인사이트를 가장 먼저 확인하여 데이터 기반의 빠른 의사결정을 내릴 수 있습니다.', score: 95 },
            ],
          },
           {
            id: 'mr_006',
            model: 'Llama 3',
            averageScore: 94.5,
            responses: [
              { id: 'res_011', question: '기능의 핵심 가치는?', answer: '자동 리포팅 기능은 매일 정해진 시간에 데이터를 종합하여 이메일로 보고서를 보내드립니다. 보고서 작성 시간을 절약하세요.', score: 96 },
              { id: 'res_012', question: '사용자는 어떤 이점을 얻는가?', answer: '사용자는 매일 아침 데이터 기반의 리포트를 받아보고, 신속하게 비즈니스 결정을 내릴 수 있습니다.', score: 93 },
            ],
          },
        ],
      },
    ],
    models: ['GPT-4o', 'Llama 3'],
    questions: ['기능의 핵심 가치는?', '사용자는 어떤 이점을 얻는가?'],
    winner: {
      promptContent: '새로운 기능인 "자동 리포팅"에 대해 사용자가 이해하기 쉽게 설명해줘.',
      model: 'GPT-4o',
    },
    userSelection: {
      promptContent: '새로운 기능인 "자동 리포팅"에 대해 사용자가 이해하기 쉽게 설명해줘.',
      model: 'Llama 3',
    },
    advancedSettings: {
      'Temperature': 0.8,
      'Top P': 0.9,
      'Max Tokens': 1024,
      'Frequency Penalty': 0.5,
    },
  },
];