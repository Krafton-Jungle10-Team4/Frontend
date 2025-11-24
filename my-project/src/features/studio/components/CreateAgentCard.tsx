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
        'relative bg-white/85 rounded-2xl overflow-hidden border border-white/70',
        'group flex flex-col shadow-[0_16px_44px_rgba(55,53,195,0.12)] backdrop-blur'
      )}
    >
      <div className="p-5 flex flex-col gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">서비스 만들기</p>
          <h3 className="font-semibold text-lg text-gray-900">새 봇을 시작하거나 템플릿 복제</h3>
          <p className="text-sm text-gray-600 mt-1">빈 상태로 만들거나 기존 템플릿을 기반으로 빠르게 시작하세요.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onCreateBlank}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#3735c3] hover:bg-indigo-50"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 flex-shrink-0 text-[#3735c3]" />
              <span>새로 시작</span>
            </div>
          </button>

          <button
            onClick={onCreateFromTemplate}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#3735c3] hover:bg-indigo-50"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 flex-shrink-0 text-[#3735c3]" />
              <span>템플릿</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
