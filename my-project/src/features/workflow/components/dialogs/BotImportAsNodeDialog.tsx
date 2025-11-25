import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { ScrollArea } from '@/shared/components/scroll-area';
import { toast } from 'sonner';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import { createImportedWorkflowNode } from '@/features/workflow/utils/createImportedWorkflowNode';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import type { Bot } from '@/features/bot/types/bot.types';
import type { WorkflowVersionSummary } from '@/features/workflow/types/api.types';
import { cn } from '@/shared/utils/cn';
import { ChevronDown, ChevronUp, Loader2, FileText } from 'lucide-react';

interface BotImportAsNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function BotImportAsNodeDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: BotImportAsNodeDialogProps) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [expandedBotId, setExpandedBotId] = useState<string | null>(null);
  const [versionsMap, setVersionsMap] = useState<Record<string, WorkflowVersionSummary[]>>({});
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [loadingVersionsMap, setLoadingVersionsMap] = useState<Record<string, boolean>>({});
  const [importingVersionId, setImportingVersionId] = useState<string | null>(null);
  const addNode = useWorkflowStore((state) => state.addNode);

  useEffect(() => {
    if (open) {
      loadBots();
    } else {
      setSelectedBot(null);
      setExpandedBotId(null);
      setVersionsMap({});
      setLoadingVersionsMap({});
      setImportingVersionId(null);
    }
  }, [open]);

  const loadBots = async () => {
    setIsLoadingBots(true);
    try {
      const allBots = await botApi.getAll({ onlyMine: true });
      setBots(allBots);
    } catch (error) {
      console.error('Failed to load bots:', error);
      toast.error('로드 실패', {
        description: '서비스 목록을 불러오는 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoadingBots(false);
    }
  };

  const loadVersions = async (botId: string) => {
    if (versionsMap[botId]) {
      return; // 이미 로드됨
    }

    setLoadingVersionsMap(prev => ({ ...prev, [botId]: true }));
    try {
      const allVersions = await workflowApi.listWorkflowVersions(botId);
      const publishedVersions = allVersions.filter(v => v.status === 'published');
      setVersionsMap(prev => ({ ...prev, [botId]: publishedVersions }));
    } catch (error) {
      console.error('Failed to load versions:', error);
      toast.error('로드 실패', {
        description: '버전 목록을 불러오는 중 오류가 발생했습니다.',
      });
    } finally {
      setLoadingVersionsMap(prev => ({ ...prev, [botId]: false }));
    }
  };

  const handleBotToggle = async (bot: Bot) => {
    if (expandedBotId === bot.id) {
      // 이미 확장된 봇 클릭 시 닫기
      setExpandedBotId(null);
      setSelectedBot(null);
    } else {
      // 새로운 봇 선택
      setExpandedBotId(bot.id);
      setSelectedBot(bot);
      await loadVersions(bot.id);
    }
  };

  const handleVersionClick = async (bot: Bot, version: WorkflowVersionSummary) => {
    try {
      setImportingVersionId(version.id);

      const versionDetail = await workflowApi.getWorkflowVersionDetail(
        bot.id,
        version.id
      );

      // PortDefinition 배열 형태로 input_schema와 output_schema 생성
      const input_schema = versionDetail.features?.file_upload
        ? [
            {
              name: 'query',
              type: 'string' as const,
              required: true,
              description: '사용자 질의',
              display_name: '질의',
            },
            {
              name: 'files',
              type: 'array_file' as const,
              required: false,
              description: '첨부 파일',
              display_name: '파일',
            },
          ]
        : [
            {
              name: 'query',
              type: 'string' as const,
              required: true,
              description: '사용자 질의',
              display_name: '질의',
            },
          ];

      const output_schema = [
        {
          name: 'text',
          type: 'string' as const,
          required: true,
          description: '응답 텍스트',
          display_name: '응답',
        },
      ];

      const agentData = {
        id: version.id,
        library_name: bot.name,
        library_description: bot.description || '',
        version: version.version.toString(),
        graph: versionDetail.graph,
        input_schema,
        output_schema,
        node_count: versionDetail.graph?.nodes?.length || 0,
        edge_count: versionDetail.graph?.edges?.length || 0,
      };

      const newNode = createImportedWorkflowNode(agentData, {
        x: 300,
        y: 200,
      });

      addNode(newNode);

      toast.success('노드 추가 완료', {
        description: `${bot.name} (v${version.version})이(가) 캔버스에 추가되었습니다.`,
      });

      onImportSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('가져오기 실패', {
        description: '노드 추가 중 오류가 발생했습니다.',
      });
    } finally {
      setImportingVersionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>서비스 선택</DialogTitle>
          <DialogDescription>
            워크플로우를 가져올 서비스를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoadingBots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                사용 가능한 서비스가 없습니다.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {bots.map((bot) => {
                  const isExpanded = expandedBotId === bot.id;
                  const versions = versionsMap[bot.id] || [];
                  const isLoadingVersions = loadingVersionsMap[bot.id];

                  return (
                    <div key={bot.id} className="border rounded-lg overflow-hidden">
                      {/* 봇 헤더 */}
                      <button
                        onClick={() => handleBotToggle(bot)}
                        className={cn(
                          'w-full flex items-center justify-between p-4',
                          'transition-colors text-left group',
                          isExpanded
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-sm truncate">
                              {bot.name}
                            </h3>
                            <Badge variant={bot.status === 'active' ? 'success' : 'default'} className="flex-shrink-0">
                              {bot.status === 'active' ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          {bot.description && (
                            <p
                              className="text-xs text-muted-foreground overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {bot.description}
                            </p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        )}
                      </button>

                      {/* 버전 드롭다운 */}
                      {isExpanded && (
                        <div className="border-t bg-muted/30">
                          {isLoadingVersions ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <p className="text-xs text-muted-foreground">
                                발행된 버전이 없습니다.
                              </p>
                            </div>
                          ) : (
                            <div className={cn(
                              "p-2 space-y-1",
                              versions.length > 3 && "max-h-[240px] overflow-y-auto"
                            )}>
                              {versions.map((version) => {
                                const isImporting = importingVersionId === version.id;
                                return (
                                  <button
                                    key={version.id}
                                    onClick={() => handleVersionClick(bot, version)}
                                    disabled={isImporting}
                                    className={cn(
                                      'w-full flex items-center justify-between p-3 rounded-md border',
                                      'transition-all duration-200 text-left',
                                      isImporting
                                        ? 'bg-blue-50/50 border-blue-400 dark:bg-blue-500/10 dark:border-blue-500/50 cursor-wait'
                                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600'
                                    )}
                                  >
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-medium text-xs">
                                          버전 {version.version}
                                        </h4>
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                          발행됨
                                        </Badge>
                                        {isImporting && (
                                          <Badge variant="default" className="text-xs flex-shrink-0 bg-blue-600">
                                            가져오는 중...
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {new Date(version.created_at).toLocaleString('ko-KR')}
                                      </p>
                                      {version.description && (
                                        <p
                                          className="text-xs text-muted-foreground mt-1 overflow-hidden"
                                          style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                          }}
                                        >
                                          {version.description}
                                        </p>
                                      )}
                                    </div>
                                    {isImporting && (
                                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0 ml-2" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
