/**
 * Results & Validation Page Type Definitions
 * 결과 & 검증 페이지 타입 정의
 */

// Data Structures
export interface TestResult {
  id: string;
  testSetId: string;
  prompt: string;
  model: string;
  provider: string;
  promptTemplate?: string;
  overallScore: number;
  qualityScore: number;
  speedScore: number;
  costScore: number;
  avgResponseTime: number;
  totalCost: number;
  userSatisfaction: number;
  questions: TestResultQuestion[];
  evaluationMetrics: EvaluationMetric[];
}

export interface ComparisonData {
  metric: string;
  [key: string]: any;
}

export interface ResponseExample {
  id: string;
  question: string;
  answer: string;
  rating: number;
}

export interface EvaluationMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement';
  color: string;
}

// WinnerCard.tsx
export interface WinnerCardProps {
  winner: {
    name: string;
    overallScore: number;
    responseTime: number;
    cost: string;
    promptTemplate?: string;
  };
  onShare?: () => void;
  onUse?: () => void;
}

// TestResultCards.tsx
export interface TestResultCardsProps {
  testResults: TestResult[];
  selectedId: string | null;
  onSelectTest?: (id: string) => void;
  onVisibleCardsChange?: (visibleIds: string[]) => void;
}

// DetailedAnalysisTabs.tsx
export interface DetailedAnalysisTabsProps {
  allTests: TestResult[];
  selectedTest: TestResult | undefined;
  visibleModelIds: string[];
}