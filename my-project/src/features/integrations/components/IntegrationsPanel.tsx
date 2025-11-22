/**
 * IntegrationsPanel Component
 * 외부 서비스 연동 관리 패널
 */
import React, { useEffect } from 'react';
import { useSlackStore } from '../stores/slackStore';
import { Button } from '@/shared/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import { AlertCircle, CheckCircle2, Slack, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/alert';

interface IntegrationsPanelProps {
  botId?: string;
}

export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ botId }) => {
  const {
    integrations,
    currentIntegration,
    isLoading,
    error,
    fetchIntegrations,
    fetchBotIntegration,
    deleteIntegration,
    connectSlack,
  } = useSlackStore();

  useEffect(() => {
    if (botId) {
      fetchBotIntegration(botId);
    } else {
      fetchIntegrations();
    }
  }, [botId]);

  const handleConnect = () => {
    connectSlack(botId);
  };

  const handleDelete = async (integrationId: number) => {
    if (confirm('이 Slack 연동을 삭제하시겠습니까?')) {
      await deleteIntegration(integrationId);
      if (botId) {
        fetchBotIntegration(botId);
      }
    }
  };

  const displayIntegrations = botId
    ? currentIntegration
      ? [currentIntegration]
      : []
    : integrations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Slack 연동</h2>
          <p className="text-sm text-muted-foreground mt-1">
            워크플로우에서 Slack으로 메시지를 전송하려면 연동이 필요합니다.
          </p>
        </div>
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          style={{ backgroundColor: '#2563eb' }}
          className="gap-2 hover:bg-[#1d4ed8] text-white transition-all duration-200 hover:scale-[1.03]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Slack className="h-4 w-4" />
          )}
          Slack 연동하기
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Integration List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : displayIntegrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Slack className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              연동된 Slack 워크스페이스가 없습니다.
            </p>
            <Button
              onClick={handleConnect}
              variant="outline"
              className="gap-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all duration-200 hover:scale-[1.03]"
            >
              <Slack className="h-4 w-4" />
              Slack 연동하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayIntegrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.workspace_icon ? (
                      <img
                        src={integration.workspace_icon}
                        alt={integration.workspace_name}
                        className="h-10 w-10 rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-[#4A154B] flex items-center justify-center">
                        <Slack className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {integration.workspace_name}
                      </CardTitle>
                      <CardDescription>
                        ID: {integration.workspace_id}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.is_active ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        활성
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        비활성
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(integration.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {integration.bot_user_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bot User ID:</span>
                      <span className="font-mono">{integration.bot_user_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">권한:</span>
                    <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                      {integration.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">연동 날짜:</span>
                    <span>
                      {new Date(integration.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>안내:</strong> Slack 연동을 통해 워크플로우에서 Slack 채널로 메시지를
          전송할 수 있습니다. 워크플로우 편집기에서 Slack 노드를 추가하고 채널을 선택하세요.
        </AlertDescription>
      </Alert>
    </div>
  );
};

