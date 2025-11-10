/**
 * Context provider for BotSetup state management
 */

import { createContext, useContext, useState, ReactNode } from 'react';
// import { generateSessionId } from '@/shared/utils/session'; // Removed: no longer need session IDs
import { TEXT_LIMITS } from '@/shared/constants/textLimits';
import type {
  GoalType,
  KnowledgeTab,
  Website,
  FileItem,
} from './types';

export interface BotSetupContextType {
  // Step 1: Name
  botName: string;
  setBotName: (name: string) => void;

  // Step 2: Goal
  selectedGoal: GoalType;
  setSelectedGoal: (goal: GoalType) => void;
  customGoal: string;
  setCustomGoal: (goal: string) => void;
  showCustomInput: boolean;
  setShowCustomInput: (show: boolean) => void;

  // Step 3: Knowledge
  knowledgeTab: KnowledgeTab;
  setKnowledgeTab: (tab: KnowledgeTab) => void;
  websites: Website[];
  setWebsites: (websites: Website[] | ((prev: Website[]) => Website[])) => void;
  files: FileItem[];
  setFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
  knowledgeText: string;
  setKnowledgeText: (text: string) => void;

  // Created Bot
  createdBotId: string | null;
  setCreatedBotId: (botId: string | null) => void;

  // Navigation
  step: number;
  setStep: (step: number) => void;

  // Loading states
  isRefiningPrompt: boolean;
  setIsRefiningPrompt: (loading: boolean) => void;
  isDiscoveringUrls: string | null;
  setIsDiscoveringUrls: (websiteId: string | null) => void;

  // Dialog
  showExitDialog: boolean;
  setShowExitDialog: (show: boolean) => void;

  // Validation
  isStepValid: (step: number) => boolean;
  hasAnyData: () => boolean;

  // Reset
  resetAllData: () => void;
}

const BotSetupContext = createContext<BotSetupContextType | undefined>(
  undefined
);

export function BotSetupProvider({ children }: { children: ReactNode }) {
  // Step 1: Name
  const [botName, setBotName] = useState('');

  // Step 2: Goal
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Step 3: Knowledge
  const [knowledgeTab, setKnowledgeTab] = useState<KnowledgeTab>('websites');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [knowledgeText, setKnowledgeText] = useState('');

  // Navigation
  const [step, setStep] = useState(1);

  // Loading states
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [isDiscoveringUrls, setIsDiscoveringUrls] = useState<string | null>(
    null
  );

  // Dialog
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Created Bot ID (set after Step 1)
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);

  // Validation functions
  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return (
          botName.trim().length > 0 &&
          botName.trim().length <= TEXT_LIMITS.BOT_NAME.MAX
        );

      case 2:
        if (selectedGoal === null) return false;
        if (selectedGoal === 'other') {
          return (
            customGoal.trim().length > 0 &&
            customGoal.trim().length <= TEXT_LIMITS.BOT_GOAL.MAX
          );
        }
        return true;

      case 3:
        // At least one knowledge source
        return (
          files.some((f) => f.status === 'uploaded') ||
          websites.some((w) => w.discovered) ||
          (knowledgeText.trim().length > 0 &&
            knowledgeText.trim().length <= TEXT_LIMITS.KNOWLEDGE_TEXT.MAX)
        );

      default:
        return false;
    }
  };

  const hasAnyData = (): boolean => {
    return (
      files.some((f) => f.status === 'uploaded') ||
      websites.some((w) => w.discovered) ||
      knowledgeText.trim().length > 0
    );
  };

  const resetAllData = () => {
    setBotName('');
    setSelectedGoal(null);
    setCustomGoal('');
    setShowCustomInput(false);
    setKnowledgeTab('websites');
    setWebsites([]);
    setFiles([]);
    setKnowledgeText('');
    setStep(1);
    setShowExitDialog(false);
    setCreatedBotId(null);
  };

  const value: BotSetupContextType = {
    // Step 1
    botName,
    setBotName,

    // Step 2
    selectedGoal,
    setSelectedGoal,
    customGoal,
    setCustomGoal,
    showCustomInput,
    setShowCustomInput,

    // Step 3
    knowledgeTab,
    setKnowledgeTab,
    websites,
    setWebsites,
    files,
    setFiles,
    knowledgeText,
    setKnowledgeText,

    // Created Bot
    createdBotId,
    setCreatedBotId,

    // Navigation
    step,
    setStep,

    // Loading states
    isRefiningPrompt,
    setIsRefiningPrompt,
    isDiscoveringUrls,
    setIsDiscoveringUrls,

    // Dialog
    showExitDialog,
    setShowExitDialog,

    // Validation
    isStepValid,
    hasAnyData,

    // Reset
    resetAllData,
  };

  return (
    <BotSetupContext.Provider value={value}>
      {children}
    </BotSetupContext.Provider>
  );
}

export function useBotSetup() {
  const context = useContext(BotSetupContext);
  if (!context) {
    throw new Error('useBotSetup must be used within BotSetupProvider');
  }
  return context;
}
