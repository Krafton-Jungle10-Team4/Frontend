import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { ScrollArea } from '@/shared/components/scroll-area';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import type { Bot } from '@/features/bot/types/bot.types';
import type { WorkflowVersionSummary } from '@/features/workflow/types/api.types';
import { Loader2, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '@/shared/components/badge';
import { cn } from '@/shared/components/utils';

interface BotVersionSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (botId: string, versionId: string, botName: string) => void;
}

export function BotVersionSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: BotVersionSelectorDialogProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersionSummary | null>(null);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [step, setStep] = useState<'bot' | 'version'>('bot');

  useEffect(() => {
    if (open) {
      loadBots();
    } else {
      setSelectedBot(null);
      setSelectedVersion(null);
      setVersions([]);
      setStep('bot');
    }
  }, [open]);

  const loadBots = async () => {
    setIsLoadingBots(true);
    try {
      const allBots = await botApi.getAll({ onlyMine: true });
      setBots(allBots);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setIsLoadingBots(false);
    }
  };

  const loadVersions = async (botId: string) => {
    setIsLoadingVersions(true);
    try {
      const allVersions = await workflowApi.listWorkflowVersions(botId);
      const publishedVersions = allVersions.filter(v => v.status === 'published');
      setVersions(publishedVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleBotSelect = async (bot: Bot) => {
    setSelectedBot(bot);
    await loadVersions(bot.id);
    setStep('version');
  };

  const handleVersionSelect = (version: WorkflowVersionSummary) => {
    setSelectedVersion(version);
  };

  const handleConfirm = () => {
    if (selectedBot && selectedVersion) {
      onSelect(selectedBot.id, selectedVersion.id, selectedBot.name);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep('bot');
    setSelectedBot(null);
    setSelectedVersion(null);
    setVersions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'bot' ? '봇 선택' : '버전 선택'}
          </DialogTitle>
          <DialogDescription>
            {step === 'bot'
              ? '워크플로우를 가져올 봇을 선택하세요.'
              : `${selectedBot?.name}의 발행된 버전을 선택하세요.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'bot' ? (
          <div className="py-4">
            {isLoadingBots ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  사용 가능한 봇이 없습니다.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {bots.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => handleBotSelect(bot)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border',
                        'hover:bg-accent hover:border-accent-foreground/20 transition-colors',
                        'text-left group'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {bot.name}
                          </h3>
                          <Badge variant={bot.status === 'active' ? 'success' : 'default'}>
                            {bot.status === 'active' ? '활성' : '비활성'}
                          </Badge>
                        </div>
                        {bot.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {bot.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className="py-4">
            {isLoadingVersions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  발행된 버전이 없습니다.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => handleVersionSelect(version)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border',
                        'hover:bg-accent transition-colors text-left',
                        selectedVersion?.id === version.id && 'bg-accent border-accent-foreground/20'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">
                            버전 {version.version}
                          </h3>
                          <Badge variant="outline">
                            {version.status === 'published' ? '발행됨' : version.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString('ko-KR')}
                        </p>
                        {version.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {version.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'version' && (
            <Button variant="outline" onClick={handleBack}>
              이전
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          {step === 'version' && (
            <Button
              onClick={handleConfirm}
              disabled={!selectedVersion}
            >
              확인
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
