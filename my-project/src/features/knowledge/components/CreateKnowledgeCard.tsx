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
        'relative bg-white/80 rounded-2xl overflow-hidden border border-white/60',
        'group h-[180px] flex flex-col shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur-md'
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff]" />
      <div className="p-5 pt-6 flex flex-col h-full">
        <h3 className="font-semibold text-sm text-gray-800 mb-3 px-1">
          지식 만들기
        </h3>

        <p className="text-xs text-gray-500 mb-3 px-1">
          외부 문서를 업로드해 지식 베이스를 확장하세요.
        </p>

        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={onImportFromFile}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-[#3735c3]/10 hover:text-[#3735c3] rounded-lg transition-colors text-left border border-transparent hover:border-[#3735c3]/30"
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">파일에서 가져오기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
