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
    <div className="w-12 h-full bg-white border-r border-sidebar-border flex flex-col items-center py-4 gap-6">
      <button
        onClick={onLogoClick}
        className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg hover:opacity-80 transition-opacity shadow-sm"
      ></button>
      <div className="flex flex-col gap-4 flex-1">
        <button
          onClick={handleHomeClick}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home size={20} />
        </button>
        <div className="border-t border-sidebar-border my-2 mx-auto w-4/5" />
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`p-2 rounded-md transition-all ${
              activeView === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
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
