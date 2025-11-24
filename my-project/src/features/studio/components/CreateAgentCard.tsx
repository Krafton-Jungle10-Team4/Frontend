import { cn } from '@/shared/components/utils';
import { Plus } from 'lucide-react';

interface CreateAgentCardProps {
  onCreateBlank: () => void;
  onCreateFromTemplate: () => void;
}

export function CreateAgentCard({
  onCreateBlank,
  onCreateFromTemplate,
}: CreateAgentCardProps) {
  // keep for compatibility with upstream props; template action handled elsewhere
  void onCreateFromTemplate;

  return (
    <button
      onClick={onCreateBlank}
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 p-4',
        'transition-all duration-200 cursor-pointer',
        'hover:border-blue-300 hover:bg-blue-50',
        'flex flex-col items-center justify-center'
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3 group-hover:bg-blue-100 transition-colors">
        <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>

      <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
        새 서비스 만들기
      </span>
    </button>
  );
}
