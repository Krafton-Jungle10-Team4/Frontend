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
