/**
 * Prompt Studio Type Definitions
 * 프롬프트 엔지니어링 스튜디오 타입 정의
 */

import { LucideIcon } from 'lucide-react';

/**
 * 프롬프트 템플릿
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  prompt: string;
}

/**
 * AI 모델 설정
 */
export interface ModelConfig {
  id: string;
  provider: 'OpenAI' | 'Google' | 'Anthropic';
  name: string;
  price: string;
  speed: string;
  quality: string;
}

/**
 * 고급 설정
 */
export interface AdvancedSettings {
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * 테스트 질문
 */
export interface TestQuestion {
  id: string;
  value: string;
}

/**
 * 프롬프트 세트 (독립적인 테스트 그룹)
 */
export interface PromptSet {
  id: string;
  templateId: string | null;
  promptText: string;
  questions: TestQuestion[];
  selectedModels: string[];
  advancedSettings: AdvancedSettings;
  isAdvancedOpen: boolean;
}

/**
 * 테스트 세트 실행 결과 (모델별)
 */
export interface TestSetExecutionResult {
  modelId: string;
  modelName: string;
  qualityScore: number;
  speedScore: number;
  costScore: number;
  avgResponseTime: number;
  totalCost: number;
  userSatisfaction: number;
}

/**
 * 완전한 테스트 세트 결과
 */
export interface TestSetResult {
  testSetId: string;
  executedAt: string;
  promptTemplate: string;
  questions: TestQuestion[];
  selectedModels: string[];
  advancedSettings: AdvancedSettings;
  results: TestSetExecutionResult[];
}

// Component Props Types

export interface TemplateSelectorProps {
  templates: PromptTemplate[];
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
  onAddCustomTemplate?: () => void;
}

export interface PromptEditorProps {
  selectedTemplate: string | null;
  templates: PromptTemplate[];
  promptText: string;
  questions: TestQuestion[];
  onPromptTextChange: (text: string) => void;
  onQuestionsChange: (questions: TestQuestion[]) => void;
}

export interface ModelSelectorProps {
  models: ModelConfig[];
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
}

export interface AdvancedSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  temperature: number[];
  onTemperatureChange: (value: number[]) => void;
  topP: number[];
  onTopPChange: (value: number[]) => void;
  maxTokens: number | undefined;
  onMaxTokensChange: (value: number | undefined) => void;
  stopSequences: string;
  onStopSequencesChange: (value: string) => void;
}

export interface PromptSetPaginationProps {
  totalSets: number;
  activeIndex: number;
  onSetChange: (index: number) => void;
}

export interface TestSetListProps {
  testSets: TestSetResult[];
}
