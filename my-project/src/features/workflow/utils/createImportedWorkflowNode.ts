import type { Node } from '@xyflow/react';
import type { LibraryAgentDetail } from '../types/workflow.types';
import type { ImportedWorkflowNodeData } from '../types/import-node.types';
import { nanoid } from 'nanoid';

/**
 * 라이브러리 에이전트를 ImportedWorkflowNode로 변환
 *
 * @throws Error - 필수 필드 누락 시 (input_schema, output_schema, graph)
 */
export function createImportedWorkflowNode(
  agent: LibraryAgentDetail,
  position: { x: number; y: number }
): Node<ImportedWorkflowNodeData> {
  // 필수 필드 검증: 배열 타입을 요구, 빈 배열은 허용
  if (!Array.isArray(agent.input_schema)) {
    throw new Error(
      `라이브러리 서비스 ${agent.id}에 input_schema가 없습니다. ` +
      'API 응답을 확인하세요.'
    );
  }
  if (agent.input_schema.length === 0) {
    console.warn(`라이브러리 서비스 ${agent.id}의 input_schema가 비어 있습니다.`);
  }

  if (!Array.isArray(agent.output_schema)) {
    throw new Error(
      `라이브러리 서비스 ${agent.id}에 output_schema가 없습니다. ` +
      'API 응답을 확인하세요.'
    );
  }
  if (agent.output_schema.length === 0) {
    console.warn(`라이브러리 서비스 ${agent.id}의 output_schema가 비어 있습니다.`);
  }
  if (!agent.graph) {
    throw new Error(
      `라이브러리 서비스 ${agent.id}에 graph가 없습니다. ` +
      'API 응답을 확인하세요.'
    );
  }

  const nodeId = `imported_${agent.id}_${nanoid(4)}`;

  return {
    id: nodeId,
    type: 'imported-workflow',
    position,
    data: {
      // 기본 정보
      type: 'imported-workflow',
      title: agent.library_name,
      desc: agent.library_description || '',

      // ✅ 백엔드 실행 필수: config.source_version_id
      config: {
        source_version_id: agent.id,  // 필수: 라이브러리 버전 UUID
      },

      // 레거시 호환성 (UI 표시용, template_id = source_version_id)
      template_id: agent.id,
      template_name: agent.library_name,
      template_version: agent.version,

      // 포트 정의 (라이브러리 상세의 input_schema/output_schema 복사)
      ports: {
        inputs: agent.input_schema,
        outputs: agent.output_schema,
      },

      // 서브그래프 정보 (확장 뷰에서 표시)
      internal_graph: agent.graph,

      // 변수 매핑 (초기값 빈 객체, 사용자가 에디터에서 설정)
      variable_mappings: {},

      // 노드 상태
      is_expanded: false,  // 초기에는 축소 상태
      read_only: true,     // 항상 읽기 전용
    },
  };
}

/**
 * 노드 직렬화 검증 (저장 전 호출)
 *
 * @throws Error - 백엔드 필수 필드 누락 시
 */
export function validateImportedWorkflowNode(
  node: Node<ImportedWorkflowNodeData>
): void {
  if (!node.data.config?.source_version_id) {
    throw new Error(
      `ImportedWorkflowNode ${node.id}에 config.source_version_id가 없습니다. ` +
      '백엔드 실행이 불가능합니다.'
    );
  }

  if (!node.data.ports?.inputs || !node.data.ports?.outputs) {
    throw new Error(
      `ImportedWorkflowNode ${node.id}에 포트 정의가 없습니다.`
    );
  }

  if (!node.data.internal_graph) {
    throw new Error(
      `ImportedWorkflowNode ${node.id}에 internal_graph가 없습니다.`
    );
  }
}
