import { Home, Bot, Clock, MessageSquare, Settings } from 'lucide-react';

interface LeftSidebarProps {
  onLogoClick?: () => void;
}

export function LeftSidebar({ onLogoClick }: LeftSidebarProps) {
  return (
    <div className="w-12 h-full bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-6">
      <button 
        onClick={onLogoClick}
        className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg hover:opacity-80 transition-opacity"
      ></button>
      <div className="flex flex-col gap-4 flex-1">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Home size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Bot size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Clock size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <MessageSquare size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
