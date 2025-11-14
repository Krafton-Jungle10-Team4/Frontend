// src/features/workflow/components/variable/VarReferencePickerExample.tsx

/**
 * VarReferencePicker 통합 예시
 *
 * 이 파일은 VarReferencePicker를 NodeConfigPanel에서 사용하는 방법을 보여줍니다.
 * 실제 노드 Panel 컴포넌트에서 이 패턴을 따라 구현하세요.
 */

import { useWorkflowStore } from '../../stores/workflowStore';
import { VarReferencePicker } from './VarReferencePicker';
import { BasePanel } from '../nodes/_base/base-panel';
import { Box, Group, Field } from '../nodes/_base/components/layout';
import { Textarea } from '@shared/components/textarea';
import { PortType, ValueSelector } from '@shared/types/workflow';

/**
 * 예시: LLM 노드 Panel에서 VarReferencePicker 사용
 */
export function LLMNodeConfigExample() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  /**
   * 변수 매핑 업데이트 헬퍼 함수
   * @param portName - 대상 입력 포트 이름
   * @param selector - 변수 선택자 (null이면 매핑 제거)
   */
  const handleVariableChange = (
    portName: string,
    selector: ValueSelector | null
  ) => {
    const currentMappings = node.variable_mappings || {};

    updateNode(selectedNodeId!, {
      variable_mappings: {
        ...currentMappings,
        [portName]: selector
          ? {
              target_port: portName,
              source: selector,
            }
          : undefined,
      },
    });
  };

  /**
   * 현재 매핑된 변수 가져오기
   */
  const getUserMessageMapping = () => {
    return node.variable_mappings?.query?.source || null;
  };

  const getContextMapping = () => {
    return node.variable_mappings?.context?.source || null;
  };

  return (
    <BasePanel>
      <Box>
        <Group title="입력 설정" description="노드의 입력 데이터를 설정하세요">
          {/*
            예시 1: 필수 입력 포트 (STRING 타입)
            - query 포트에 변수 연결
            - 다른 노드의 STRING 타입 출력만 표시됨
          */}
          <Field label="사용자 메시지" required>
            <VarReferencePicker
              nodeId={node.id}
              portName="query"
              portType={PortType.STRING}
              value={getUserMessageMapping()}
              onChange={(selector) =>
                handleVariableChange('query', selector)
              }
              placeholder="변수 선택 또는 직접 입력..."
            />
          </Field>

          {/*
            예시 2: 선택적 입력 포트
            - context 포트에 변수 연결 (Knowledge Retrieval 출력 등)
          */}
          <Field
            label="컨텍스트"
            description="지식베이스 검색 결과를 연결하세요"
          >
            <VarReferencePicker
              nodeId={node.id}
              portName="context"
              portType={PortType.STRING}
              value={getContextMapping()}
              onChange={(selector) => handleVariableChange('context', selector)}
              placeholder="지식베이스 결과 연결..."
            />
          </Field>

          {/*
            예시 3: 변수 대신 직접 입력도 가능하게 하려면
            - VarReferencePicker와 Textarea를 함께 사용
            - 사용자가 선택 가능하도록 토글 추가 가능
          */}
          <Field
            label="프롬프트"
            description="변수를 선택하거나 직접 입력하세요"
          >
            <div className="space-y-2">
              <VarReferencePicker
                nodeId={node.id}
                portName="prompt"
                portType={PortType.STRING}
                value={node.variable_mappings?.prompt?.source || null}
                onChange={(selector) =>
                  handleVariableChange('prompt', selector)
                }
                placeholder="변수 선택..."
              />
              <div className="text-xs text-gray-500">또는</div>
              <Textarea
                value={node.data.prompt as string}
                onChange={(e) =>
                  updateNode(selectedNodeId!, { prompt: e.target.value })
                }
                rows={6}
                placeholder="프롬프트를 직접 입력..."
              />
            </div>
          </Field>
        </Group>

        {/*
          예시 4: 다른 타입의 포트
          - NUMBER, ARRAY, OBJECT 등 다른 타입도 동일한 방식으로 사용
        */}
        <Group title="고급 설정">
          <Field label="파라미터 (OBJECT 타입)">
            <VarReferencePicker
              nodeId={node.id}
              portName="parameters"
              portType={PortType.OBJECT}
              value={node.variable_mappings?.parameters?.source || null}
              onChange={(selector) =>
                handleVariableChange('parameters', selector)
              }
              placeholder="객체 변수 선택..."
            />
          </Field>
        </Group>
      </Box>
    </BasePanel>
  );
}

/**
 * 통합 가이드
 *
 * 1. 노드의 입력 포트 정의 확인
 *    - node.ports.inputs 배열에서 입력 포트 목록 확인
 *    - 각 포트의 name, type, required 속성 확인
 *
 * 2. VarReferencePicker 추가
 *    - nodeId: 현재 노드 ID
 *    - portName: 대상 입력 포트 이름
 *    - portType: 포트 타입 (자동 필터링)
 *    - value: 현재 매핑된 변수 (variable_mappings에서 가져옴)
 *    - onChange: 변수 매핑 업데이트 핸들러
 *
 * 3. 변수 매핑 저장 구조
 *    node.variable_mappings = {
 *      [portName]: {
 *        target_port: portName,
 *        source: {
 *          variable: "node_id.port_name",
 *          value_type: PortType.STRING
 *        }
 *      }
 *    }
 *
 * 4. 주의사항
 *    - 변수 매핑과 직접 입력을 함께 지원하려면 UI 분기 필요
 *    - variable_mappings가 있으면 변수 우선, 없으면 data 사용
 *    - 백엔드에서 실행 시 variable_mappings를 먼저 확인하고 resolving
 */
