/**
 * Bot Filter Component
 *
 * Dropdown selector for filtering documents by bot ID
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useBotStore, selectBots } from '@/features/bot/stores/botStore';

interface BotFilterProps {
  value?: string;
  onChange: (botId: string | undefined) => void;
}

export const BotFilter: React.FC<BotFilterProps> = ({ value, onChange }) => {
  const bots = useBotStore(selectBots);

  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
    >
      <SelectTrigger className="w-[200px] h-10">
        <SelectValue placeholder="모든 서비스" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">모든 서비스</SelectItem>
        {bots.map((bot) => (
          <SelectItem key={bot.id} value={bot.id}>
            {bot.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
