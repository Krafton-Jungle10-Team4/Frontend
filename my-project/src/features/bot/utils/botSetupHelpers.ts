/**
 * BotSetup Helper Functions
 * BotSetup Context 데이터를 API 요청 형식으로 변환
 */

import type { CreateBotDto } from '../types/bot.types';
import type { BotSetupContextType } from '../components/BotSetup/BotSetupContext';
import type { FileItem } from '../components/BotSetup/types';
import { BotGoal } from '@/shared/types/api.types';

/**
 * BotSetupContext → CreateBotDto 변환
 * 폼 데이터를 Bot 생성 API 요청 형식으로 변환합니다.
 */
export function buildCreateBotDto(context: BotSetupContextType): CreateBotDto {
  const {
    botName,
    selectedGoal,
    customGoal,
    files,
  } = context;

  // 1. Goal 결정
  let goal: string;
  if (selectedGoal === 'other') {
    goal = customGoal.trim();
  } else if (selectedGoal === null) {
    // Fallback: null인 경우 기본값
    goal = BotGoal.AiAssistant;
  } else {
    goal = selectedGoal; // 'customer-support', 'ai-assistant', 'sales'
  }

  // 2. Knowledge: 업로드된 파일의 document_id 수집
  const documentIds = files
    .filter((f: FileItem) => f.status === 'uploaded')
    .map((f: FileItem) => f.id);

  // 3. CreateBotDto 생성
  return {
    name: botName.trim(),
    goal,
    knowledge: documentIds,
  };
}

/**
 * Goal 값을 BotGoal enum으로 변환 (타입 체크용)
 */
export function mapGoalToEnum(goal: string): BotGoal {
  switch (goal) {
    case 'customer-support':
      return BotGoal.CustomerSupport;
    case 'ai-assistant':
      return BotGoal.AiAssistant;
    case 'sales':
      return BotGoal.Sales;
    case 'other':
      return BotGoal.Other;
    default:
      return BotGoal.AiAssistant; // Fallback
  }
}

/**
 * 폼 데이터 유효성 검증
 */
export function validateBotSetupData(context: BotSetupContextType): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Name 검증
  if (!context.botName.trim()) {
    errors.push('Bot name is required');
  } else if (context.botName.trim().length > 100) {
    errors.push('Bot name must be less than 100 characters');
  }

  // Goal 검증
  if (context.selectedGoal === null) {
    errors.push('Goal is required');
  } else if (context.selectedGoal === 'other' && !context.customGoal.trim()) {
    errors.push('Custom goal is required');
  }

  // Knowledge 검증 (최소 1개 이상)
  const hasUploadedFiles = context.files.some(
    (f: FileItem) => f.status === 'uploaded'
  );
  if (!hasUploadedFiles) {
    errors.push('At least one knowledge file is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
