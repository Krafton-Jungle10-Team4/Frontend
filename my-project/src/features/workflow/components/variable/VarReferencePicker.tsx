// src/features/workflow/components/variable/VarReferencePicker.tsx

import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/popover';
import { Button } from '@shared/components/button';
import { Input } from '@shared/components/input';
import { VariableSelector } from './VariableSelector';
import { VariablePath } from './VariablePath';
import { useAvailableVariables } from '../../hooks/useAvailableVariables';
import { useRecentVariables } from '../../hooks/useRecentVariables';
import { ValueSelector, PortType, VariableReference } from '@shared/types/workflow';
import { RiCodeBoxLine, RiCloseLine } from '@remixicon/react';

interface VarReferencePickerProps {
  /** 현재 노드 ID */
  nodeId: string;

  /** 대상 입력 포트 이름 */
  portName: string;

  /** 포트 타입 (필터링용) */
  portType: PortType;

  /** 현재 선택된 변수 */
  value?: ValueSelector | null;

  /** 변수 선택 시 콜백 */
  onChange: (selector: ValueSelector | null) => void;

  /** Placeholder 텍스트 */
  placeholder?: string;

  /** 비활성화 여부 */
  disabled?: boolean;
}

export function VarReferencePicker({
  nodeId,
  portName,
  portType,
  value,
  onChange,
  placeholder = '변수 선택...',
  disabled = false,
}: VarReferencePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 사용 가능한 변수 목록
  const availableVariables = useAvailableVariables(nodeId, portType);

  // 최근 사용 변수
  const { recentVariables, addRecentVariable } = useRecentVariables();

  // 검색 필터링
  const filteredVariables = useMemo(() => {
    if (!searchQuery) return availableVariables;

    const lowerQuery = searchQuery.toLowerCase();
    return availableVariables.filter(
      (v) =>
        v.nodeTitle.toLowerCase().includes(lowerQuery) ||
        v.portDisplayName.toLowerCase().includes(lowerQuery) ||
        v.fullPath.toLowerCase().includes(lowerQuery)
    );
  }, [availableVariables, searchQuery]);

  // 최근 변수 필터링 (사용 가능한 것만)
  const recentFilteredVariables = useMemo(() => {
    const availablePaths = new Set(availableVariables.map((v) => v.fullPath));
    return recentVariables.filter((v) => availablePaths.has(v.fullPath));
  }, [recentVariables, availableVariables]);

  // 변수 선택 핸들러
  const handleSelect = (variable: VariableReference) => {
    const selector: ValueSelector = {
      variable: variable.fullPath,
      value_type: variable.type,
    };

    onChange(selector);
    addRecentVariable(variable);
    setOpen(false);
    setSearchQuery('');
  };

  // 선택 해제
  const handleClear = () => {
    onChange(null);
  };

  // 현재 선택된 변수 정보
  const selectedVariable = availableVariables.find(
    (v) => v.fullPath === value?.variable
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedVariable ? (
            <VariablePath variable={selectedVariable} showType={false} compact />
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}

          <div className="flex items-center gap-1">
            {selectedVariable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1"
              >
                <RiCloseLine size={16} />
              </button>
            )}
            <RiCodeBoxLine size={16} />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="start">
        <div className="flex flex-col h-full max-h-[400px]">
          {/* 검색 */}
          <div className="p-3 border-b">
            <Input
              placeholder="변수 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* 변수 목록 */}
          <div className="flex-1 overflow-y-auto">
            {/* 최근 사용 변수 */}
            {!searchQuery && recentFilteredVariables.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                  최근 사용
                </div>
                {recentFilteredVariables.slice(0, 3).map((variable) => (
                  <VariableSelector
                    key={variable.fullPath}
                    variable={variable}
                    isSelected={variable.fullPath === value?.variable}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {/* 모든 변수 */}
            <div className="p-2">
              {!searchQuery && (
                <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                  사용 가능한 변수
                </div>
              )}

              {filteredVariables.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery
                    ? '검색 결과가 없습니다'
                    : '사용 가능한 변수가 없습니다'}
                </div>
              ) : (
                filteredVariables.map((variable) => (
                  <VariableSelector
                    key={variable.fullPath}
                    variable={variable}
                    isSelected={variable.fullPath === value?.variable}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
