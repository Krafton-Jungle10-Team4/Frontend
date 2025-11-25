import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/shared/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { toast } from 'sonner';
import { deploymentApi } from '@/features/deployment/api/deploymentApi';
import { botApi } from '@/features/bot/api/botApi';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';

const formSchema = z.object({
  target_bot_id: z.string().min(1, "대상 서비스를 선택해주세요."),
});

interface LibraryDeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: LibraryAgentVersion;
  onDeploySuccess?: () => void;
}

export function LibraryDeployDialog({
  open,
  onOpenChange,
  agent,
  onDeploySuccess,
}: LibraryDeployDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [bots, setBots] = useState<any[]>([]);
  const [hasExistingDeployment, setHasExistingDeployment] = useState(false);
  const [existingDeployment, setExistingDeployment] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_bot_id: agent.bot_id,
    },
  });

  // 봇 목록 조회
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botList = await botApi.list();
        setBots(botList);
      } catch (error) {
        console.error('Failed to fetch bots:', error);
      }
    };

    if (open) {
      fetchBots();
    }
  }, [open]);

  // 기존 배포 확인 (Phase 6.1)
  const targetBotId = form.watch('target_bot_id');

  useEffect(() => {
    if (!open || !targetBotId) return;

    const checkExistingDeployment = async () => {
      try {
        const deployment = await deploymentApi.get(targetBotId);
        setExistingDeployment(deployment);
        setHasExistingDeployment(!!deployment);
      } catch (error) {
        setExistingDeployment(null);
        setHasExistingDeployment(false);
      }
    };

    checkExistingDeployment();
  }, [open, targetBotId]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsDeploying(true);

      // 기본 Widget 설정
      const defaultWidgetConfig = {
        theme: 'light' as const,
        position: 'bottom-right' as const,
        auto_open: false,
        primary_color: '#0066FF',
        bot_name: agent.library_name,
      };

      await deploymentApi.createOrUpdate(data.target_bot_id, {
        workflow_version_id: agent.id,
        status: 'published',
        widget_config: defaultWidgetConfig,
      });

      toast.success('배포 성공', {
        description: `${agent.library_name} ${agent.version}이(가) 성공적으로 배포되었습니다.`,
        className: 'toast-success-green',
        style: {
          border: '1px solid #10B981',
          backgroundColor: '#F7FEF9',
        },
      });

      onDeploySuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('배포 실패', {
        description: '배포 중 오류가 발생했습니다.',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서비스 배포</DialogTitle>
          <DialogDescription>
            {agent.library_name} {agent.version}을(를) 배포합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="target_bot_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대상 서비스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="서비스를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bots.map((bot) => (
                        <SelectItem key={bot.bot_id} value={bot.bot_id}>
                          {bot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    이 서비스를 배포할 서비스를 선택하세요.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Phase 6.1: 롤백 경고 UI */}
            {hasExistingDeployment && existingDeployment && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  ⚠️ 롤백 경고
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  현재 배포된 버전: {existingDeployment.workflow_version_id}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  이 작업은 기존 배포를 {agent.version}(으)로 업데이트합니다.
                </p>
              </div>
            )}

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                ⚠️ 선택한 서비스의 기존 배포가 있다면 이 버전으로 업데이트됩니다.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDeploying}
              >
                취소
              </Button>
              <Button type="submit" disabled={isDeploying}>
                {isDeploying ? "배포 중..." : "배포하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
