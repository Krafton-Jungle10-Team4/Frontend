import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/components/button';
import { useWorkflowStore } from '../../stores/workflowStore';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/api/errorHandler';

export const SaveButton = () => {
  const { botId } = useParams<{ botId: string }>();
  const {
    saveWorkflow,
    validateBotWorkflow,
    isSaving,
    hasUnsavedChanges,
    lastSaveError
  } = useWorkflowStore();
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!botId) {
      toast.error('Bot ID가 없습니다');
      return;
    }

    try {
      setIsValidating(true);
      // 1. 봇 전용 검증 (팀 권한/봇 존재 여부 체크)
      const isValid = await validateBotWorkflow(botId);
      if (!isValid) {
        // 검증 오류는 ValidationPanel에서 표시되므로 토스트 제거
        return;
      }

      // 2. 저장
      await saveWorkflow(botId);
      toast.success('워크플로우가 저장되었습니다');
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error('Save failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleSave}
        disabled={isSaving || isValidating}
        className={hasUnsavedChanges ? 'border-orange-500' : ''}
      >
        {isSaving ? '저장 중...' : isValidating ? '검증 중...' : '저장'}
        {hasUnsavedChanges && !isSaving && !isValidating && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-orange-500" />
        )}
      </Button>
      {lastSaveError && (
        <div className="absolute top-full mt-1 text-xs text-red-600 whitespace-nowrap">
          {lastSaveError}
        </div>
      )}
    </div>
  );
};
