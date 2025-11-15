import { useEffect, useMemo, useState } from 'react';
import { Button } from '@shared/components/button';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@shared/components/sheet';
import { Label } from '@shared/components/label';
import { Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflowStore';
import type { NodeVariableMappings, ValueSelector } from '@shared/types/workflow';

type VariableType = 'string' | 'number' | 'boolean' | 'object' | 'array';

type VariableItem = {
  id: string;
  name: string;
  type: VariableType;
  value: string;
};

const TYPE_OPTIONS: { value: VariableType; label: string; placeholder: string; defaultValue: string }[] = [
  { value: 'string', label: '문자열', placeholder: '텍스트 값을 입력하세요', defaultValue: '' },
  { value: 'number', label: '숫자', placeholder: '숫자 값을 입력하세요', defaultValue: '0' },
  { value: 'boolean', label: '불리언', placeholder: 'true 또는 false', defaultValue: 'true' },
  { value: 'object', label: 'JSON 객체', placeholder: '{"key":"value"}', defaultValue: '{}' },
  { value: 'array', label: 'JSON 배열', placeholder: '[1, 2, 3]', defaultValue: '[]' },
];

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const detectType = (value: unknown): VariableType => {
  if (Array.isArray(value)) {
    return 'array';
  }
  switch (typeof value) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
};

const stringifyValue = (value: unknown, type: VariableType): string => {
  if (value === undefined || value === null) {
    return TYPE_OPTIONS.find((option) => option.value === type)?.defaultValue ?? '';
  }

  if (type === 'object' || type === 'array') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return TYPE_OPTIONS.find((option) => option.value === type)?.defaultValue ?? '';
    }
  }

  return String(value);
};

const parseValue = (raw: string, type: VariableType): unknown => {
  switch (type) {
    case 'number':
      return Number(raw);
    case 'boolean':
      return raw === 'true';
    case 'object':
    case 'array':
      if (!raw.trim()) {
        return type === 'array' ? [] : {};
      }
      const parsed = JSON.parse(raw);
      if (type === 'array' && !Array.isArray(parsed)) {
        throw new Error('배열 형태의 JSON이 필요합니다');
      }
      if (type === 'object' && (typeof parsed !== 'object' || Array.isArray(parsed))) {
        throw new Error('객체 형태의 JSON이 필요합니다');
      }
      return parsed;
    default:
      return raw;
  }
};

const convertToItems = (record: Record<string, unknown>): VariableItem[] => {
  return Object.entries(record).map(([name, value]) => {
    const type = detectType(value);
    return {
      id: uuid(),
      name,
      type,
      value: stringifyValue(value, type),
    };
  });
};

type ConversationVariablePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ConversationVariablePanel = ({ open, onOpenChange }: ConversationVariablePanelProps) => {
  const conversationVariables = useWorkflowStore((state) => state.conversationVariables);
  const setConversationVariables = useWorkflowStore((state) => state.setConversationVariables);

  const [items, setItems] = useState<VariableItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const initialItems = useMemo(() => convertToItems(conversationVariables || {}), [conversationVariables]);

  useEffect(() => {
    if (open) {
      setItems(initialItems);
      setError(null);
    }
  }, [open, initialItems]);

  const handleAddVariable = () => {
    setItems((prev) => [
      ...prev,
      {
        id: uuid(),
        name: '',
        type: 'string',
        value: '',
      },
    ]);
  };

  const handleChange = (id: string, patch: Partial<VariableItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleTypeChange = (id: string, type: VariableType) => {
    const defaultValue = TYPE_OPTIONS.find((option) => option.value === type)?.defaultValue ?? '';
    handleChange(id, { type, value: defaultValue });
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    const nextRecord: Record<string, unknown> = {};
    const names = new Set<string>();

    try {
      for (const item of items) {
        if (!item.name.trim()) {
          continue;
        }
        if (names.has(item.name)) {
          throw new Error(`중복된 변수명: ${item.name}`);
        }
        const parsed = parseValue(item.value, item.type);
        names.add(item.name);
        nextRecord[item.name] = parsed;
      }

      setConversationVariables(nextRecord);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대화 변수를 저장할 수 없습니다');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle>대화 변수</SheetTitle>
          <SheetDescription>
            세션마다 유지되는 변수를 정의하고 기본 값을 지정할 수 있습니다. Variable Assigner, LLM 노드 등에서
            해당 변수를 읽거나 쓸 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              아직 생성된 대화 변수가 없습니다. 아래 버튼을 눌러 변수를 추가하세요.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const typeMeta = TYPE_OPTIONS.find((option) => option.value === item.type);
                return (
                  <div key={item.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs">변수명</Label>
                        <Input
                          value={item.name}
                          placeholder="예: conversation_var"
                          onChange={(event) => handleChange(item.id, { name: event.target.value })}
                        />
                      </div>
                      <div className="w-36 space-y-1.5">
                        <Label className="text-xs">타입</Label>
                        <Select value={item.type} onValueChange={(value: VariableType) => handleTypeChange(item.id, value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">기본값</Label>
                      {item.type === 'object' || item.type === 'array' ? (
                        <Textarea
                          value={item.value}
                          placeholder={typeMeta?.placeholder}
                          rows={4}
                          onChange={(event) => handleChange(item.id, { value: event.target.value })}
                        />
                      ) : item.type === 'boolean' ? (
                        <Select
                          value={item.value}
                          onValueChange={(value) => handleChange(item.id, { value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">true</SelectItem>
                            <SelectItem value="false">false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={item.value}
                          type={item.type === 'number' ? 'number' : 'text'}
                          placeholder={typeMeta?.placeholder}
                          onChange={(event) => handleChange(item.id, { value: event.target.value })}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button variant="outline" onClick={handleAddVariable} className="w-full">
            + 변수 추가
          </Button>
        </div>

        <SheetFooter className="mt-6">
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

