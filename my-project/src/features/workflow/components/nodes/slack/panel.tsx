/**
 * Slack Panel Component
 * Slack 노드 설정 패널
 * 
 * 설계 원칙:
 * - Slack 연동은 사용자 레벨 (배포와 독립적)
 * - 배포 없이도 연동 및 테스트 가능
 * - 채널 입력 항상 가능
 */
import { BasePanel } from '../_base/base-panel';
import { Field, Group } from '../_base/components/layout';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Switch } from '@/shared/components/switch';
import { Button } from '@/shared/components/button';
import { useSlackStore } from '@/features/integrations/stores/slackStore';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SlackPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const botId = useWorkflowStore((state) => state.botId);

  const { currentIntegration, fetchBotIntegration, connectSlack } = useSlackStore();
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const nodeData = selectedNode?.data || {};

  const channel = (nodeData as any).channel || '';
  const useBlocks = (nodeData as any).use_blocks || false;
  const integrationId = (nodeData as any).integration_id;

  // 봇 연동 정보 로드 (배포 불필요!)
  useEffect(() => {
    if (botId) {
      fetchBotIntegration(botId);
    }
  }, [botId, fetchBotIntegration]);

  // Slack 연동이 있는데 노드에 설정되지 않은 경우 자동 설정
  useEffect(() => {
    if (currentIntegration && !integrationId && selectedNodeId) {
      console.log('[SlackPanel] Auto-setting integration_id:', currentIntegration.id);
      updateNode(selectedNodeId, {
        integration_id: currentIntegration.id,
      });
    }
  }, [currentIntegration, integrationId, selectedNodeId, updateNode]);

  // 채널 목록 로드
  useEffect(() => {
    if (currentIntegration?.id) {
      // 채널 목록 조회 API 호출
      // TODO: API 구현 후 실제 채널 목록 로드
      setChannels([]);
    }
  }, [currentIntegration]);

  const handleChannelChange = (value: string) => {
    console.log('[SlackPanel] Updating channel:', { nodeId: selectedNodeId, channel: value });
    updateNode(selectedNodeId!, { channel: value });
    console.log('[SlackPanel] After updateNode, checking node data...');
  };

  const handleUseBlocksChange = (checked: boolean) => {
    updateNode(selectedNodeId!, { use_blocks: checked });
  };

  const handleIntegrationSelect = () => {
    if (currentIntegration) {
      updateNode(selectedNodeId!, {
        integration_id: currentIntegration.id,
      });
    }
  };

  const handleConnectSlack = async () => {
    // 배포 체크 제거! 바로 Slack OAuth 시작
    try {
      await connectSlack(botId);
      // connectSlack이 window.location.href로 OAuth URL로 이동시킴
    } catch (error) {
      console.error('Slack 연동 시작 실패:', error);
      alert('Slack 연동을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  return (
    <BasePanel title="Slack 메시지 전송">
      <Group>
        {!currentIntegration ? (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-blue-900">Slack 연동이 필요합니다</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Slack 워크스페이스를 연동하면 워크플로우에서 메시지를 전송할 수 있습니다.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectSlack}
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="w-4 h-4" />
                  Slack 연동하기
                </Button>
                <p className="text-xs text-blue-600">
                  💡 연동 후 바로 이 워크플로우에서 사용할 수 있습니다.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Slack 연동 완료
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      워크스페이스: {currentIntegration.workspace_name}
                    </p>
                  </div>
                  {!integrationId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleIntegrationSelect}
                      className="text-green-700 hover:text-green-800"
                    >
                      이 연동 사용
                    </Button>
                  )}
                </div>
                <p className="text-xs text-green-600">
                  ✓ 이제 워크플로우를 실행하면 Slack으로 메시지가 전송됩니다.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Field>
          <Label htmlFor="slack-channel">채널 ID 또는 이름</Label>
          <Input
            id="slack-channel"
            type="text"
            value={channel}
            onChange={(e) => handleChannelChange(e.target.value)}
            placeholder="예: C12345678 또는 #general"
          />
          <p className="text-xs text-gray-500 mt-1">
            {currentIntegration 
              ? 'Slack 채널 ID (예: C12345678) 또는 # 형식의 채널 이름 (예: #general)을 입력하세요.'
              : 'Slack 연동 후 워크플로우를 실행하면 이 채널로 메시지가 전송됩니다.'}
          </p>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="use-blocks">블록 포맷 사용</Label>
            <Switch
              id="use-blocks"
              checked={useBlocks}
              onCheckedChange={handleUseBlocksChange}
              disabled={false}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            제목과 본문을 구분하여 보기 좋게 표시합니다.
          </p>
        </Field>
      </Group>

      <Group title="입력 포트">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="font-medium">text</span> (필수): 전송할 메시지
            텍스트
          </div>
          {useBlocks && (
            <div>
              <span className="font-medium">title</span> (선택): 메시지 제목
            </div>
          )}
        </div>
      </Group>

      <Group title="출력 포트">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="font-medium">success</span>: 전송 성공 여부
          </div>
          <div>
            <span className="font-medium">message_ts</span>: 메시지 타임스탬프
          </div>
          <div>
            <span className="font-medium">channel</span>: 전송된 채널 ID
          </div>
          <div>
            <span className="font-medium">error</span>: 에러 메시지 (실패 시)
          </div>
        </div>
      </Group>
    </BasePanel>
  );
}

