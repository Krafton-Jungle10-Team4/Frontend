import { Button } from '@/shared/components/button';
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
        'relative bg-white rounded-studio overflow-hidden',
        'border border-gray-300',
        'hover:shadow-studio-card hover:scale-[1.02] transition-all duration-200',
        'group h-full flex flex-col'
      )}
    >

      <div className="p-5 flex flex-col h-full">
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-base text-studio-text-primary mb-4">
            에이전트 만들기
          </h3>

          <div className="flex gap-3 flex-1">
            <Button
              variant="outline"
              size="sm"
              rounded="sharp"
              onClick={onCreateBlank}
              className="flex-1 flex-col justify-center items-center h-full bg-white text-black !border-gray-300 relative overflow-hidden group/btn hover:scale-105 transition-transform duration-200 py-8 hover:bg-white hover:!border-gray-300 focus:!border-gray-300 focus-visible:!border-gray-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-black to-blue-600 -translate-x-[110%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex flex-col items-center gap-2 group-hover/btn:text-white transition-colors duration-300">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">빈 상태로 시작</span>
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              rounded="sharp"
              onClick={onCreateFromTemplate}
              className="flex-1 flex-col justify-center items-center h-full bg-white text-black !border-gray-300 relative overflow-hidden group/btn hover:scale-105 transition-transform duration-200 py-8 hover:bg-white hover:!border-gray-300 focus:!border-gray-300 focus-visible:!border-gray-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-black to-blue-600 -translate-x-[110%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex flex-col items-center gap-2 group-hover/btn:text-white transition-colors duration-300">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">템플릿에서 시작</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
