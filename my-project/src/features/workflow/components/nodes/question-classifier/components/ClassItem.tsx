import { Input } from '@/shared/components/input';
import { Button } from '@/shared/components/button';
import { GripVertical, Trash2 } from 'lucide-react';
import type { Topic } from '@/shared/types/workflow.types';

interface ClassItemProps {
  topic: Topic;
  index: number;
  onChange: (name: string) => void;
  onRemove: () => void;
  readonly?: boolean;
}

/**
 * 개별 클래스 아이템
 * 드래그 가능, 이름 편집, 삭제 기능
 */
export function ClassItem({ topic, index, onChange, onRemove, readonly = false }: ClassItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white">
      {/* 드래그 핸들 */}
      {!readonly && (
        <div className="drag-handle cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* 클래스 번호 */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-medium">
        {index + 1}
      </div>

      {/* 클래스 이름 입력 */}
      <Input
        type="text"
        value={topic.name}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Class ${index + 1} 이름`}
        className="flex-1"
        disabled={readonly}
      />

      {/* 삭제 버튼 */}
      {!readonly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
