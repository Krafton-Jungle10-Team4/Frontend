import { cn } from '@/shared/components/utils';
import { Upload } from 'lucide-react';

interface CreateKnowledgeCardProps {
  onImportFromFile: () => void;
}

export function CreateKnowledgeCard({
  onImportFromFile,
}: CreateKnowledgeCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-xl overflow-hidden',
        'group h-[160px] flex flex-col'
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <h3 className="font-medium text-xs text-gray-600 mb-3 px-3">
          지식 만들기
        </h3>

        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={onImportFromFile}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors text-left"
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            <span>파일에서 가져오기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
