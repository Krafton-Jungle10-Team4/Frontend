import { useBotStore } from '@features/bot/stores/botStore';
import { useUIStore } from '@shared/stores/uiStore';
import { Bot, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyBotsSidebar() {
  const bots = useBotStore(state => state.bots);
  const language = useUIStore(state => state.language);
  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    navigate(`/bot/${botId}`);
  };

  return (
    <div className="w-[220px] h-full bg-gray-50/80 border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200">
        <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {language === 'ko' ? '탐색' : 'Explore'}
        </span>
      </div>

      <div className="flex-1 p-4">
        <h3 className="text-xs font-medium text-gray-500 mb-3 px-1">
          {language === 'ko' ? '작업 공간' : 'Workspace'}
        </h3>
        <div className="space-y-0.5">
          {bots.length === 0 ? (
            <div className="text-xs text-gray-400 py-3 px-3">
              {language === 'ko' ? '생성된 봇이 없습니다' : 'No bots created'}
            </div>
          ) : (
            bots.map(bot => (
              <button
                key={bot.id}
                onClick={() => handleBotClick(bot.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-white/80 hover:shadow-sm transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="truncate text-gray-700 font-medium group-hover:text-gray-900">
                  {bot.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
