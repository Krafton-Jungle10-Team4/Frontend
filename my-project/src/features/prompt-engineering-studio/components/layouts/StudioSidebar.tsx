import { NavLink } from 'react-router-dom';
import { FlaskConical, History } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';

export function StudioSidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'p-2 rounded-lg transition-colors',
      isActive
        ? 'bg-teal-500/20 text-teal-400'
        : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
    );

  return (
    <div className="w-16 bg-gray-900/80 border-r border-white/10 flex flex-col items-center p-4 gap-6 sticky top-0 h-screen self-start">
      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg"></div>
      <TooltipProvider>
        <nav className="flex flex-col gap-4 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink to="/prompt-studio" end className={navLinkClass}>
                <FlaskConical size={24} />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Prompt Engineering Studio</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink to="/prompt-studio/test-sets" className={navLinkClass}>
                <History size={24} />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Test Set List</p>
            </TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </div>
  );
}
