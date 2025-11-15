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
 * 클래스 추가/삭제/정렬 기능
 */
export function ClassList({ classes, onChange, readonly = false }: ClassListProps) {
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

  return (
    <div className="space-y-3">
      {/* 클래스 목록 */}
      <div className="space-y-2">
        {classes.map((topic, index) => (
          <ClassItem
            key={topic.id}
            topic={topic}
            index={index}
            onChange={(name) => handleClassChange(index, name)}
            onRemove={() => handleRemoveClass(index)}
            readonly={readonly}
          />
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
