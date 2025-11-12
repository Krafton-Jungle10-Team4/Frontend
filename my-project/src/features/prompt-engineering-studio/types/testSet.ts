export interface TestSet {
  id: string;
  name: string;
  createdAt: string;
  prompts: PromptResult[];
  models: string[];
  questions: string[];
  winner: {
    promptContent: string;
    model: string;
  };
  userSelection?: {
    promptContent: string;
    model: string;
  };
  advancedSettings?: {
    [key: string]: string | number;
  };
}

export interface PromptResult {
  id: string;
  content: string;
  modelResults: ModelResult[];
}

export interface ModelResult {
  id: string;
  model: string;
  responses: ResponseItem[];
  averageScore: number;
}

export interface ResponseItem {
  id: string;
  question: string;
  answer: string;
  score: number;
}
