import { FC, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Input } from '@shared/components/input';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { Search } from 'lucide-react';
import { useAvailableVariables } from '../hooks/useAvailableVariables';
import { useVariableAssigner } from '../hooks/useVariableAssigner';
import type { VarType, AvailableVariable } from '../types';

/**
 * VariablePicker Props
 */
interface VariablePickerProps {
  /** 현재 노드 ID */
  nodeId: string;

  /** 그룹 ID (그룹 모드인 경우) */
  groupId?: string;

  /** 타입 필터 (특정 타입만 표시) */
  filterType?: VarType;

  /** 닫기 핸들러 */
  onClose: () => void;
}

/**
 * 변수 선택 모달 컴포넌트
 *
 * 워크플로우 내에서 사용 가능한 변수를 검색하고 선택할 수 있는 모달입니다.
 * 노드별로 그룹화되어 표시되며, 검색 및 타입 필터링을 지원합니다.
 */
export const VariablePicker: FC<VariablePickerProps> = ({
  nodeId,
  groupId,
  filterType,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const variableGroups = useAvailableVariables(nodeId, filterType);
  const { handleAddVariable } = useVariableAssigner(nodeId);

  // 검색 필터링
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return variableGroups;

    const query = searchQuery.toLowerCase();
    return variableGroups
      .map((group) => ({
        ...group,
        variables: group.variables.filter(
          (v) =>
            v.displayName.toLowerCase().includes(query) ||
            v.portName.toLowerCase().includes(query) ||
            v.nodeName.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.variables.length > 0);
  }, [variableGroups, searchQuery]);

  const handleSelect = (variable: AvailableVariable) => {
    handleAddVariable(variable.selector, variable.type, groupId);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>변수 선택</DialogTitle>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="변수 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 변수 목록 */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              사용 가능한 변수가 없습니다
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.nodeId} className="space-y-2">
                {/* 노드 헤더 */}
                <div className="sticky top-0 bg-white border-b pb-2">
                  <h4 className="font-semibold text-sm">
                    {group.nodeName}
                    <Badge variant="outline" className="ml-2">
                      {group.nodeType}
                    </Badge>
                  </h4>
                </div>

                {/* 변수 목록 */}
                <div className="space-y-1">
                  {group.variables.map((variable, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(variable)}
                      className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {variable.displayName}
                        </p>
                        <code className="text-xs text-gray-500">
                          {variable.selector.join('.')}
                        </code>
                        {variable.description && (
                          <p className="text-xs text-gray-400 mt-1">
                            {variable.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{variable.type}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t pt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
