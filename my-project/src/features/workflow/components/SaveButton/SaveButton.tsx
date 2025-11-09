import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/components/button';
import { useWorkflowStore } from '../../stores/workflowStore';
import { toast } from 'sonner';

export const SaveButton = () => {
  const { botId } = useParams<{ botId: string }>();
  const { saveWorkflow, validateBotWorkflow, isSaving } = useWorkflowStore();
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!botId) {
      toast.error('Bot ID가 없습니다');
      return;
    }

    try {
      // 1. 봇 전용 검증 (팀 권한/봇 존재 여부 체크)
      setIsValidating(true);
      const isValid = await validateBotWorkflow(botId);
      setIsValidating(false);

      if (!isValid) {
        // 검증 오류는 ValidationPanel에서 표시되므로 토스트 제거
        return;
      }

      // 2. 저장
      await saveWorkflow(botId);
      toast.success('워크플로우가 저장되었습니다');
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다');
      console.error('Save failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={isSaving || isValidating}
    >
      {isSaving ? '저장 중...' : isValidating ? '검증 중...' : '저장'}
    </Button>
  );
};
