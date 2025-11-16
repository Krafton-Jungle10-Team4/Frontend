import { memo } from 'react';
import { Spline, Activity, FileText, BookOpen } from 'lucide-react';
export type SidebarView = 'flow' | 'monitoring' | 'logs' | 'knowledge';

export interface WorkflowSlimSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onLogoClick?: () => void;
}

const WorkflowSlimSidebar = ({
  activeView,
  onViewChange,
  onLogoClick,
}: WorkflowSlimSidebarProps) => {

  const menuItems: { id: SidebarView; icon: React.ElementType }[] = [
    { id: 'flow', icon: Spline },
    { id: 'knowledge', icon: BookOpen },
    { id: 'monitoring', icon: Activity },
    { id: 'logs', icon: FileText },
  ];

  return (
    <div className="fixed left-4 top-20 z-50 w-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4">
      <div className="flex flex-col gap-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-2 rounded-lg transition-colors ${
              activeView === item.id
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(WorkflowSlimSidebar);
