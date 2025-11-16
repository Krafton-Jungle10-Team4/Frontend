import { Wrench } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { useUIStore } from '@/shared/stores/uiStore';

export function ToolsPage() {
  const { language } = useUIStore();

  return (
    <div className="flex h-full items-center justify-center">
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
  );
}
