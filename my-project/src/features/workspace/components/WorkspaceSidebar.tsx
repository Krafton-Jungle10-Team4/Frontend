import { Store, Workflow, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/components/Logo';
import { cn } from '@/shared/components/utils';

type WorkspaceTab = 'marketplace' | 'studio' | 'knowledge' | 'library';

interface WorkspaceSidebarProps {
  activeTab: WorkspaceTab;
  onTabChange?: (tab: WorkspaceTab) => void;
  isOpen?: boolean;
}

const tabItems: { id: WorkspaceTab; label: string; icon: React.ElementType; path: string }[] = [
  { id: 'marketplace', label: '마켓플레이스', icon: Store, path: '/workspace/marketplace' },
  { id: 'studio', label: '스튜디오', icon: Workflow, path: '/workspace/studio' },
  { id: 'knowledge', label: '지식 관리', icon: BookOpen, path: '/workspace/knowledge' },
];

export function WorkspaceSidebar({ activeTab, onTabChange, isOpen = false }: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (tab: WorkspaceTab, path: string) => {
    onTabChange?.(tab);
    navigate(path);
  };

  return (
    <div
      className={cn(
        'h-screen bg-gray-50 border-r border-gray-200 flex flex-col items-center pt-4 pb-8 flex-shrink-0',
        'w-14'
      )}
    >
      <button
        aria-label="홈"
        onClick={() => handleClick('studio', '/workspace/studio')}
        className={cn(
          'flex h-10 w-10 items-center justify-center transition-transform hover:scale-105',
          isOpen ? 'self-start pl-1' : ''
        )}
      >
        <Logo className="h-10 w-10 text-indigo-500" />
      </button>
      <div className="mt-8 flex flex-col gap-3 flex-1 w-full items-center">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path) || activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id, tab.path)}
              className={cn(
                'group relative flex items-center gap-4 rounded-xl px-3 py-3 transition-colors w-12 overflow-visible',
                isActive
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              )}
              title={tab.label}
            >
              <Icon size={22} />
              <span className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black text-white text-xs font-semibold px-2 py-1 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-20">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
