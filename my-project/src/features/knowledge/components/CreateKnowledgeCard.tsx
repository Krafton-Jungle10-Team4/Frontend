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
        'relative bg-white rounded-2xl overflow-hidden border border-slate-100',
        'group h-[140px] flex flex-col shadow-[0_10px_30px_rgba(55,53,195,0.1)]'
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff]" />
      <div className="p-5 flex flex-col h-full gap-2">
        <h3 className="font-semibold text-sm text-gray-800">
          지식 만들기
        </h3>

        <p className="text-xs text-gray-600">
          파일 업로드로 지식 베이스를 확장하세요.
        </p>

        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={onImportFromFile}
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#3735c3] hover:text-[#3735c3]"
          >
            <Upload className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">파일에서 가져오기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
