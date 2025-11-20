import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { useDemoAppStore } from '../stores/demoAppStore';

export function ApiConfigForm() {
  const { apiConfig, setApiConfig } = useDemoAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>API 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiUrl">API URL</Label>
          <Input
            id="apiUrl"
            value={apiConfig.apiUrl}
            onChange={(e) =>
              setApiConfig({ ...apiConfig, apiUrl: e.target.value })
            }
            placeholder="http://localhost:8000/api/v1/public"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiConfig.apiKey}
            onChange={(e) =>
              setApiConfig({ ...apiConfig, apiKey: e.target.value })
            }
            placeholder="sk-proj-xxxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="botId">Bot ID (Optional)</Label>
          <Input
            id="botId"
            value={apiConfig.botId || ''}
            onChange={(e) =>
              setApiConfig({ ...apiConfig, botId: e.target.value })
            }
            placeholder="bot_xxxxx"
          />
        </div>
      </CardContent>
    </Card>
  );
}

