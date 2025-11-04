import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Spline, Activity, FileText } from 'lucide-react';
export type SidebarView = 'flow' | 'monitoring' | 'logs';

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
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/home');
  };

  const menuItems: { id: SidebarView; icon: React.ElementType }[] = [
    { id: 'flow', icon: Spline },
    { id: 'monitoring', icon: Activity },
    { id: 'logs', icon: FileText },
  ];

  return (
    <div className="w-12 h-full bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-6">
      <button
        onClick={onLogoClick}
        className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg hover:opacity-80 transition-opacity"
      ></button>
      <div className="flex flex-col gap-4 flex-1">
        <button
          onClick={handleHomeClick}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <Home size={20} />
        </button>
        <div className="border-t border-gray-200 my-2 mx-auto w-4/5" />
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-2 rounded-md ${
              activeView === item.id
                ? 'bg-teal-100 text-teal-500'
                : 'text-gray-400 hover:text-gray-600'
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
