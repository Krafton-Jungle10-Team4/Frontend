import { PanelLeft, Languages, User, Settings, Link2, KeyRound, Bug, Palette, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import type { Language } from '@/types';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  userName?: string;
  onHomeClick?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function TopNavigation({ onToggleSidebar, userName = 'User', onHomeClick, language, onLanguageChange }: TopNavigationProps) {
  const userInitial = userName.charAt(0).toUpperCase();
  
  // BACKEND: Fetch user email and avatar from user profile API
  // TODO: Replace with actual user data from GET /api/user/profile
  const userEmail = 'pjg1234@gmail.com';
  
  // TODO: Add userAvatar prop and use it in Avatar component
  // const userAvatar = user?.avatar;
  
  const translations = {
    en: {
      workspace: "'s Workspace",
      home: 'Home',
      accountSettings: 'Account Settings',
      linkSocialAccounts: 'Link social accounts',
      changePassword: 'Change password',
      reportBug: 'Report a bug',
      appearance: 'Appearance',
      signOut: 'Sign out'
    },
    ko: {
      workspace: '의 워크스페이스',
      home: '홈',
      accountSettings: '계정 설정',
      linkSocialAccounts: '소셜 계정 연결',
      changePassword: '비밀번호 변경',
      reportBug: '버그 신고',
      appearance: '외관',
      signOut: '로그아웃'
    }
  };

  const t = translations[language];

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
        >
          <PanelLeft size={18} className="text-gray-600" />
        </button>
        <button 
          onClick={onHomeClick}
          className="hover:text-gray-900 transition-colors truncate hidden sm:inline"
        >
          {userName}{t.workspace}
        </button>
        <span className="text-gray-400 hidden sm:inline">{'>'}</span>
        <span className="font-semibold text-gray-900 truncate">{t.home}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLanguageChange(language === 'en' ? 'ko' : 'en')}
          className="text-sm gap-1 sm:gap-2"
        >
          <Languages size={16} />
          <span className="hidden sm:inline">{language === 'en' ? '한국어' : 'English'}</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-teal-500 text-white">{userInitial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            {/* User Info */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-teal-500 text-white">{userInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <Settings size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.accountSettings}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <Link2 size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.linkSocialAccounts}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <KeyRound size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.changePassword}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <Bug size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.reportBug}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <Palette size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.appearance}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                <LogOut size={16} className="mr-3 text-gray-600" />
                <span className="text-sm">{t.signOut}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
