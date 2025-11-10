/**
 * Type definitions for BotSetup components
 */

export type GoalType =
  | 'customer-support'
  | 'ai-assistant'
  | 'sales'
  | 'other'
  | null;
export type KnowledgeTab = 'websites' | 'files' | 'text';
export type FileStatus = 'uploading' | 'uploaded' | 'deleting';

export interface Website {
  id: string;
  url: string;
  discovered: boolean;
  urls?: DiscoveredUrl[];
}

export interface DiscoveredUrl {
  id: string;
  path: string;
  children?: DiscoveredUrl[];
  selected: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  status: FileStatus;
}

export interface BotSetupData {
  // Step 1
  botName: string;

  // Step 2
  selectedGoal: GoalType;
  customGoal: string;

  // Step 3
  websites: Website[];
  files: FileItem[];
  knowledgeText: string;

  // Created Bot
  createdBotId: string | null;
}
