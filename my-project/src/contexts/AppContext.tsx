import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createMockBot } from '../data/mockBots';
import { createMockActivity } from '../data/mockActivities';
import type { Bot } from '../components/BotCard';
import type { Activity } from '../components/RightSidebar';

export type Language = 'en' | 'ko';

interface AppContextType {
  // User data
  userName: string;
  setUserName: (name: string) => void;

  // UI state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  language: Language;
  setLanguage: (lang: Language) => void;

  // Bot data
  bots: Bot[];
  setBots: (bots: Bot[]) => void;
  addBot: (botName: string) => void;
  deleteBot: (botId: string, botName: string) => void;

  // Activity data
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;

  // Filtered data
  filteredBots: Bot[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('User');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [language, setLanguage] = useState<Language>('en');
  const [bots, setBots] = useState<Bot[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load preferences on mount
  useEffect(() => {
    // TODO: Load from localStorage or API
    // const savedLanguage = localStorage.getItem('language') as Language;
    // const savedViewMode = localStorage.getItem('viewMode') as 'grid' | 'list';
  }, []);

  // Save preferences when they change
  useEffect(() => {
    // TODO: localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    // TODO: localStorage.setItem('language', language);
  }, [language]);

  // Filter bots based on search query
  const filteredBots = bots.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add a new bot
  const addBot = (botName: string) => {
    const translations = {
      en: { action: 'published a bot named' },
      ko: { action: '봇을 발행했습니다' }
    };

    const newBot = createMockBot(botName);
    setBots([...bots, newBot]);

    const newActivity = createMockActivity(
      userName,
      translations[language].action,
      newBot.name
    );
    setActivities([newActivity, ...activities]);
  };

  // Delete a bot
  const deleteBot = (botId: string, botName: string) => {
    setBots(bots.filter(bot => bot.id !== botId));

    const translations = {
      en: { action: 'deleted a bot named', timestamp: 'just now' },
      ko: { action: '봇을 삭제했습니다', timestamp: '방금 전' }
    };

    const newActivity: Activity = {
      id: Date.now().toString(),
      user: userName,
      action: translations[language].action,
      botName: botName,
      timestamp: translations[language].timestamp
    };

    setActivities([newActivity, ...activities]);
  };

  const value: AppContextType = {
    userName,
    setUserName,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    language,
    setLanguage,
    bots,
    setBots,
    addBot,
    deleteBot,
    activities,
    setActivities,
    filteredBots,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
