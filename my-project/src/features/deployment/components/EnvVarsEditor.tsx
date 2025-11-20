/**
 * EnvVarsEditor
 * Phase 6: 환경 변수 편집기 컴포넌트
 */

import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Plus, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface EnvVarsEditorProps {
  value: Record<string, string>;
  onChange: (envVars: Record<string, string>) => void;
  className?: string;
}

export function EnvVarsEditor({
  value,
  onChange,
  className
}: EnvVarsEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const envEntries = Object.entries(value);

  const handleAdd = () => {
    if (!newKey.trim()) return;

    onChange({
      ...value,
      [newKey.trim()]: newValue
    });

    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key: string) => {
    const updated = { ...value };
    delete updated[key];
    onChange(updated);
  };

  const handleUpdate = (key: string, newVal: string) => {
    onChange({
      ...value,
      [key]: newVal
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {envEntries.length > 0 && (
        <div className="space-y-2">
          {envEntries.map(([key, val]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 border border-gray-200 rounded-md"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">키</Label>
                  <Input
                    value={key}
                    disabled
                    className="bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">값</Label>
                  <Input
                    value={val}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    className="text-sm"
                    type="password"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(key)}
                className="mt-5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-3 border border-dashed border-gray-300 rounded-md">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">새 변수 키</Label>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="예: API_KEY"
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">값</Label>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="값 입력"
              className="text-sm"
              type="password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!newKey.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {envEntries.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          환경 변수가 없습니다. 위 양식으로 추가하세요.
        </p>
      )}
    </div>
  );
}
