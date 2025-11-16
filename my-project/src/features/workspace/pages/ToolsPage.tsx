import { Wrench } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { useUIStore } from '@/shared/stores/uiStore';

export function ToolsPage() {
  const { language } = useUIStore();

  return (
    <div className="flex h-full overflow-hidden bg-muted/30 p-6">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-background border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
        <EmptyState
          icon={Wrench}
          title={language === 'en' ? 'No Workflow Tools' : '워크플로우 도구 없음'}
          description={
            language === 'en'
              ? 'Publish workflows as tools from Studio'
              : '스튜디오에서 워크플로우를 도구로 게시'
          }
        />
      </div>
    </div>
  );
}
