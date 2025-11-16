/**
 * Bot Feature Types
 * Bot 관련 모든 타입 정의
 */

import type { Node, Edge } from '@/shared/types/workflow.types';

// ============= Bot Category & Tags =============
export type BotCategory = 'workflow' | 'chatflow' | 'chatbot' | 'agent';

// ============= Bot Entity Types =============
export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  status: 'draft' | 'active' | 'inactive' | 'error';
  messagesCount: number;
  errorsCount: number;
  category: BotCategory;
  tags: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  // 워크플로우 (프론트엔드 스키마 - 이미 변환됨)
  workflow?: {
    nodes: Node[];
    edges: Edge[];
  } | null;
}

// ============= Bot DTO Types =============
export interface CreateBotDto {
  name: string;
  goal?: string;
  description?: string;
  personality?: string;
  knowledge?: string[];
  workflow?: {
    nodes: Node[];
    edges: Edge[];
  };
  category?: BotCategory;
  tags?: string[];
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  avatar?: string;
  goal?: string;
  personality?: string;
  knowledge?: string[];
  workflow?: {
    nodes: Node[];
    edges: Edge[];
  };
  status?: 'draft' | 'active' | 'inactive' | 'error';
  category?: BotCategory;
  tags?: string[];
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
  category?: BotCategory;
  tags?: string[];
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
    ['draft', 'active', 'inactive', 'error'].includes(value.status)
  );
};
