import { cn } from '@/shared/components/utils';
import { Plus, FileText } from 'lucide-react';

interface CreateAgentCardProps {
  onCreateBlank: () => void;
  onCreateFromTemplate: () => void;
}

export function CreateAgentCard({
  onCreateBlank,
  onCreateFromTemplate,
}: CreateAgentCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-xl overflow-hidden',
        'group h-[160px] flex flex-col'
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <h3 className="font-medium text-xs text-gray-600 mb-3 px-3">
          서비스 만들기
        </h3>

        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={onCreateBlank}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors text-left"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span>빈 상태로 시작</span>
          </button>

          <button
            onClick={onCreateFromTemplate}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors text-left"
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>템플릿에서 시작</span>
          </button>
        </div>
      </div>
    </div>
  );
}
