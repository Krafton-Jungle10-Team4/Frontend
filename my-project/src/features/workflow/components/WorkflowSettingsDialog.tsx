import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import { Textarea } from '@shared/components/textarea';
import { useWorkflowStore } from '../stores/workflowStore';

const formatJson = (value: Record<string, unknown>) =>
  JSON.stringify(value, null, 2);

const parseJson = (value: string) => {
  if (!value.trim()) return {};
  return JSON.parse(value);
};

export const WorkflowSettingsDialog = () => {
  const environmentVariables = useWorkflowStore(
    (state) => state.environmentVariables
  );
  const conversationVariables = useWorkflowStore(
    (state) => state.conversationVariables
  );
  const setEnvironmentVariables = useWorkflowStore(
    (state) => state.setEnvironmentVariables
  );
  const setConversationVariables = useWorkflowStore(
    (state) => state.setConversationVariables
  );

  const [open, setOpen] = useState(false);
  const [envValue, setEnvValue] = useState(
    formatJson(environmentVariables || {})
  );
  const [convValue, setConvValue] = useState(
    formatJson(conversationVariables || {})
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEnvValue(formatJson(environmentVariables || {}));
      setConvValue(formatJson(conversationVariables || {}));
      setError(null);
    }
  }, [open, environmentVariables, conversationVariables]);

  const handleSave = () => {
    try {
      const parsedEnv = parseJson(envValue);
      const parsedConv = parseJson(convValue);
      setEnvironmentVariables(parsedEnv);
      setConversationVariables(parsedConv);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'JSON 파싱에 실패했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">설정</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
          <DialogDescription>
            환경 변수 및 대화 변수를 JSON 형식으로 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Environment Variables
            </label>
            <Textarea
              className="mt-2 min-h-[120px] font-mono text-sm"
              value={envValue}
              onChange={(event) => setEnvValue(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Conversation Variables
            </label>
            <Textarea
              className="mt-2 min-h-[120px] font-mono text-sm"
              value={convValue}
              onChange={(event) => setConvValue(event.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
