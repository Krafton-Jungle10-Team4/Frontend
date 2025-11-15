import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { ClassItem } from './ClassItem';
import type { Topic } from '@/shared/types/workflow.types';

interface ClassListProps {
  classes: Topic[];
  onChange: (classes: Topic[]) => void;
  readonly?: boolean;
}

/**
 * 클래스 목록 관리 컴포넌트
 * 클래스 추가/삭제/정렬 기능 (드래그 앤 드롭 지원)
 */
export function ClassList({ classes, onChange, readonly = false }: ClassListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddClass = () => {
    const newClass: Topic = {
      id: `${Date.now()}`,
      name: '',
    };
    onChange([...classes, newClass]);
  };

  const handleRemoveClass = (index: number) => {
    onChange(classes.filter((_, i) => i !== index));
  };

  const handleClassChange = (index: number, name: string) => {
    const updated = [...classes];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // 배열 재정렬
    const reordered = [...classes];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    onChange(reordered);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* 클래스 목록 */}
      <div className="space-y-2">
        {classes.map((topic, index) => (
          <div
            key={topic.id}
            draggable={!readonly}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={readonly ? '' : 'cursor-move'}
          >
            <ClassItem
              topic={topic}
              index={index}
              onChange={(name) => handleClassChange(index, name)}
              onRemove={() => handleRemoveClass(index)}
              readonly={readonly}
            />
          </div>
        ))}
      </div>

      {/* 클래스 추가 버튼 */}
      {!readonly && (
        <Button variant="outline" onClick={handleAddClass} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          클래스 추가
        </Button>
      )}
    </div>
  );
}
