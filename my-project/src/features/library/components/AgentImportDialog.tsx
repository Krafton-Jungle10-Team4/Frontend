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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Loader2 } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';

interface AgentImportDialogProps {
  open: boolean;
  onClose: () => void;
  agent: LibraryAgentVersion;
}

interface Bot {
  bot_id: string;
  name: string;
  description?: string;
}

export function AgentImportDialog({ open, onClose, agent }: AgentImportDialogProps) {
  const { importAgent } = useLibraryStore();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBots, setIsFetchingBots] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBots();
    }
  }, [open]);

  const fetchBots = async () => {
    setIsFetchingBots(true);
    try {
      const { data } = await apiClient.get('/bots');
      setBots(data || []);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      toast.error('서비스 목록을 불러올 수 없습니다.');
    } finally {
      setIsFetchingBots(false);
    }
  };

  const handleImport = async () => {
    if (!selectedBotId) {
      toast.error('서비스를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    const success = await importAgent(agent.id, selectedBotId);
    setIsLoading(false);

    if (success) {
      onClose();
      setSelectedBotId('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setSelectedBotId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서비스 가져오기</DialogTitle>
          <DialogDescription>
            {agent.library_name}을(를) 어떤 서비스로 가져오시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isFetchingBots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">서비스 목록 로딩 중...</span>
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              생성된 서비스가 없습니다. 먼저 서비스를 생성해주세요.
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  대상 서비스 선택
                </label>
                <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                  <SelectTrigger>
                    <SelectValue placeholder="서비스를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.map((bot) => (
                      <SelectItem key={bot.bot_id} value={bot.bot_id}>
                        {bot.name}
                        {bot.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {bot.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">주의사항</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>선택한 서비스의 draft 워크플로우가 덮어씌워집니다.</li>
                  <li>기존 draft의 변경사항은 저장되지 않습니다.</li>
                  <li>가져온 후 필요에 따라 수정하고 발행하세요.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleImport}
            disabled={isLoading || !selectedBotId || bots.length === 0}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
