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
        'border border-studio-card-border',
        'hover:shadow-studio-card transition-all duration-200',
        'group h-full flex flex-col'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-studio-button" />

      <div className="p-5 pt-4 flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-base text-studio-text-primary mb-1">
              에이전트 만들기
            </h3>
            <p className="text-xs text-studio-text-secondary">
              새로운 AI 워크플로우 생성
            </p>
          </div>

          <div className="space-y-2 w-full mt-auto">
            <Button
              variant="studio-primary"
              size="sm"
              rounded="sharp"
              onClick={onCreateBlank}
              className="w-full justify-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              빈 상태로 시작
            </Button>

            <Button
              variant="studio-outline"
              size="sm"
              rounded="sharp"
              onClick={onCreateFromTemplate}
              className="w-full justify-center"
            >
              <FileText className="mr-1 h-4 w-4" />
              템플릿에서 시작
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
