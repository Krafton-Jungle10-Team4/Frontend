/**
 * 노드 타입별 출력 변수 정의
 * 패널에서 "이 노드가 무엇을 출력하는지" 표시하기 위한 스펙
 */

import { BlockEnum } from '@/shared/types/workflow.types';
import { PortType } from '@/shared/types/workflow/port.types';

interface OutputVarDefinition {
  name: string;
  type: PortType;
  description: string;
  subItems?: OutputVarDefinition[];
}

/**
 * 노드 타입별 출력 변수 스펙
 */
export const NODE_OUTPUTS: Record<BlockEnum, OutputVarDefinition[]> = {
  [BlockEnum.Start]: [
    {
      name: 'query',
      type: PortType.STRING,
      description: '사용자로부터 받은 입력 메시지',
    },
    {
      name: 'session_id',
      type: PortType.STRING,
      description: '세션 식별자',
    },
  ],

  [BlockEnum.LLM]: [
    {
      name: 'response',
      type: PortType.STRING,
      description: 'LLM이 생성한 응답 텍스트',
    },
    {
      name: 'usage',
      type: PortType.OBJECT,
      description: '토큰 사용량 정보',
      subItems: [
        {
          name: 'total_tokens',
          type: PortType.NUMBER,
          description: '총 토큰 수',
        },
      ],
    },
  ],

  [BlockEnum.End]: [
    {
      name: 'final_output',
      type: PortType.OBJECT,
      description: '최종 결과 객체',
    },
  ],

  [BlockEnum.KnowledgeRetrieval]: [
    {
      name: 'context',
      type: PortType.STRING,
      description: '검색된 문서의 관련 컨텍스트',
    },
    {
      name: 'documents',
      type: PortType.ARRAY,
      description: '검색된 문서 목록 (유사도 순)',
      subItems: [
        {
          name: 'content',
          type: PortType.STRING,
          description: '문서 내용',
        },
        {
          name: 'title',
          type: PortType.STRING,
          description: '문서 제목',
        },
        {
          name: 'score',
          type: PortType.NUMBER,
          description: '유사도 점수 (0-1)',
        },
        {
          name: 'metadata',
          type: PortType.OBJECT,
          description: '문서 메타데이터',
        },
      ],
    },
  ],

  [BlockEnum.MCP]: [
    {
      name: 'result',
      type: PortType.ANY,
      description: 'MCP 실행 결과 (액션에 따라 다름)',
    },
  ],

  [BlockEnum.Answer]: [],

  [BlockEnum.TemplateTransform]: [
    {
      name: 'output',
      type: PortType.STRING,
      description: '템플릿 렌더링 결과',
    },
  ],

  [BlockEnum.QuestionClassifier]: [
    {
      name: 'class_name',
      type: PortType.STRING,
      description: '선택된 클래스 이름',
    },
    {
      name: 'usage',
      type: PortType.OBJECT,
      description: 'LLM 토큰 사용량 정보',
      subItems: [
        {
          name: 'total_tokens',
          type: PortType.NUMBER,
          description: '총 토큰 수',
        },
      ],
    },
  ],

  [BlockEnum.TavilySearch]: [
    {
      name: 'context',
      type: PortType.STRING,
      description: '검색 결과를 문자열로 결합 (LLM에 직접 전달 가능)',
    },
    {
      name: 'retrieved_documents',
      type: PortType.ARRAY,
      description: 'LLM 노드 호환 문서 배열 (Knowledge 노드와 동일 형식)',
      subItems: [
        {
          name: 'content',
          type: PortType.STRING,
          description: '검색 결과 내용',
        },
        {
          name: 'metadata',
          type: PortType.OBJECT,
          description: '검색 결과 메타데이터 (title, url, score)',
        },
      ],
    },
    {
      name: 'results',
      type: PortType.ARRAY,
      description: '원본 Tavily 검색 결과 배열',
      subItems: [
        {
          name: 'title',
          type: PortType.STRING,
          description: '검색 결과 제목',
        },
        {
          name: 'url',
          type: PortType.STRING,
          description: '검색 결과 URL',
        },
        {
          name: 'content',
          type: PortType.STRING,
          description: '검색 결과 내용',
        },
        {
          name: 'score',
          type: PortType.NUMBER,
          description: '관련도 점수',
        },
      ],
    },
    {
      name: 'answer',
      type: PortType.STRING,
      description: 'AI가 생성한 답변 (include_answer=true일 때)',
    },
    {
      name: 'result_count',
      type: PortType.NUMBER,
      description: '검색 결과 개수',
    },
    {
      name: 'response_time',
      type: PortType.NUMBER,
      description: 'Tavily API 응답 시간 (초)',
    },
  ],

  // 아직 구현되지 않은 노드 타입들
  [BlockEnum.KnowledgeBase]: [],
  [BlockEnum.Code]: [],
  [BlockEnum.IfElse]: [],
  [BlockEnum.Assigner]: [],
  [BlockEnum.Http]: [],
};

/**
 * 노드 타입에 따른 출력 변수 가져오기
 */
export function getNodeOutputs(nodeType: BlockEnum): OutputVarDefinition[] {
  return NODE_OUTPUTS[nodeType] || [];
}
