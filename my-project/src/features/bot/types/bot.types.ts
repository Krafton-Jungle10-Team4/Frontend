/**
 * Bot Feature Types
 * Bot 관련 모든 타입 정의
 */

// ============= Bot Entity Types =============
export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'error';
  messagesCount: number;
  errorsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============= Bot DTO Types =============
export interface CreateBotDto {
  name: string;
  goal?: string;
  description?: string;
  personality?: string;
  knowledge?: string[];
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'error';
}

// ============= Bot Form Types =============
export interface BotSetupFormData {
  step1: {
    botName: string;
  };
  step2: {
    selectedGoal: string;
    customGoal?: string;
  };
  step3: {
    descriptionSource: 'website' | 'text';
    websiteUrl?: string;
    personalityText?: string;
  };
  step4: {
    knowledgeText?: string;
    uploadedFiles?: File[];
    websiteUrls?: string[];
  };
}

// ============= Bot Store Types =============
export interface BotState {
  bots: Bot[];
  selectedBotId: string | null;
  loading: boolean;
  error: Error | null;
}

// ============= Bot Filter Types =============
export interface BotFilterOptions {
  search?: string;
  status?: Bot['status'];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'messagesCount';
  sortOrder?: 'asc' | 'desc';
}

// ============= Type Guards =============
export const isBot = (value: any): value is Bot => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    ['active', 'inactive', 'error'].includes(value.status)
  );
};
