/**
 * VarListInput
 *
 * 여러 입력 변수를 선택할 수 있는 리스트 (추가/삭제 기능)
 * END 노드, Template Transform 노드 등에서 사용
 */

import { VarReferencePicker } from '@features/workflow/components/variable/VarReferencePicker';
import { Button } from '@shared/components/button';
import { PortType } from '@shared/types/workflow/port.types';
import { ValueSelector } from '@shared/types/workflow/variable.types';
import { RiAddLine, RiCloseLine } from '@remixicon/react';

/**
 * Generate a unique ID using crypto API
 */
const generateId = (): string => {
  return crypto.randomUUID();
};

interface VarListInputItem {
  /** 고유 ID */
  id: string;

  /** 변수 표시명 */
  name: string;

  /** 필터링할 타입 */
  portType: PortType;

  /** 선택된 변수 경로 */
  value?: ValueSelector | null;
}

interface VarListInputProps {
  /** 현재 노드 ID */
  nodeId: string;

  /** 변수 목록 */
  variables: VarListInputItem[];

  /** 변수 목록 변경 콜백 */
  onChange: (variables: VarListInputItem[]) => void;

  /** 추가 버튼 표시 여부 */
  allowAdd?: boolean;

  /** 삭제 버튼 표시 여부 */
  allowRemove?: boolean;

  /** 읽기 전용 모드 */
  readonly?: boolean;

  /** 추가 버튼 텍스트 */
  addButtonText?: string;

  /** 기본 포트 타입 (새 변수 추가 시) */
  defaultPortType?: PortType;
}

export const VarListInput = ({
  nodeId,
  variables,
  onChange,
  allowAdd = true,
  allowRemove = true,
  readonly = false,
  addButtonText = '변수 추가',
  defaultPortType = PortType.ANY,
}: VarListInputProps) => {
  /**
   * 변수 추가
   */
  const handleAdd = () => {
    const newVariable: VarListInputItem = {
      id: generateId(),
      name: `변수 ${variables.length + 1}`,
      portType: defaultPortType,
      value: null,
    };

    onChange([...variables, newVariable]);
  };

  /**
   * 변수 삭제
   */
  const handleRemove = (id: string) => {
    onChange(variables.filter((v) => v.id !== id));
  };

  /**
   * 변수 값 변경
   */
  const handleChange = (id: string, selector: ValueSelector | null) => {
    onChange(
      variables.map((v) => (v.id === id ? { ...v, value: selector } : v))
    );
  };

  return (
    <div className="space-y-2">
      {/* 변수 목록 */}
      {variables.map((variable) => (
        <div key={variable.id} className="flex items-start gap-2">
          <div className="flex-1">
            <VarReferencePicker
              nodeId={nodeId}
              portName={variable.name}
              portType={variable.portType}
              value={variable.value}
              onChange={(selector) => handleChange(variable.id, selector)}
              disabled={readonly}
              placeholder={`${variable.name} 선택...`}
            />
          </div>

          {allowRemove && !readonly && variables.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(variable.id)}
              className="shrink-0 h-10"
              title="변수 삭제"
            >
              <RiCloseLine size={18} />
            </Button>
          )}
        </div>
      ))}

      {/* 추가 버튼 */}
      {allowAdd && !readonly && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
        >
          <RiAddLine size={16} className="mr-2" />
          {addButtonText}
        </Button>
      )}

      {/* 빈 상태 메시지 */}
      {variables.length === 0 && !allowAdd && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 border border-dashed rounded-lg">
          추가된 변수가 없습니다
        </div>
      )}
    </div>
  );
};
