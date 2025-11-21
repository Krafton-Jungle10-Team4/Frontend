import { memo } from 'react';
import { Spline, FileText, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type SidebarView = 'flow' | 'logs';

export interface WorkflowSlimSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const WorkflowSlimSidebar = ({
  activeView,
  onViewChange,
}: WorkflowSlimSidebarProps) => {
  const navigate = useNavigate();

  const menuItems: { id: SidebarView; icon: React.ElementType }[] = [
    { id: 'flow', icon: Spline },
    { id: 'logs', icon: FileText },
  ];

  return (
    <div className="fixed left-4 top-20 z-50 w-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4">
      <div className="flex flex-col gap-4 flex-1">
        {/* 홈 아이콘 - 스튜디오로 이동 */}
        <button
          onClick={() => navigate('/workspace/studio')}
          className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="스튜디오로 이동"
        >
          <Home size={20} />
        </button>

        {/* 구분선 */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

        {/* 뷰 전환 메뉴 */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-2 rounded-lg transition-colors ${
              activeView === item.id
                ? 'text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
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
