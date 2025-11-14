import {
  Home,
  Puzzle,
  BarChart3,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LeftSidebarProps {
  onLogoClick?: () => void;
}

interface MenuItem {
  id: string;
  icon: LucideIcon;
  path: string;
  onClick?: () => void;
}

export function LeftSidebar({ onLogoClick }: LeftSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { id: 'home', icon: Home, path: '/home', onClick: () => navigate('/home') },
    { id: 'integrations', icon: Puzzle, path: '/integrations' },
    { id: 'usage', icon: BarChart3, path: '/usage' },
    { id: 'billing', icon: CreditCard, path: '/billing-settings', onClick: () => navigate('/billing-settings') },
    { id: 'settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-12 h-full bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-6">
      <button
        onClick={onLogoClick}
        className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg hover:opacity-80 transition-opacity"
      ></button>
      <div className="flex flex-col gap-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`p-2 rounded-md ${
                isActive
                  ? 'bg-teal-100 text-teal-600'
                  : `text-gray-400 ${item.onClick ? 'hover:text-gray-600 hover:bg-gray-100' : 'cursor-default'}`
              }`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
