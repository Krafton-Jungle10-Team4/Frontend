import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { Plus } from 'lucide-react';
import { APIKeyList } from './APIKeyList';
import { CreateAPIKeyDialog } from './CreateAPIKeyDialog';
import { APIKeyCreatedDialog } from './APIKeyCreatedDialog';
import { ApiKey } from '../types/deployment';

interface APIKeySectionProps {
  botId: string;
  apiKeys: ApiKey[];
  isLoading: boolean;
}

export function APIKeySection({ botId, apiKeys, isLoading }: APIKeySectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">API 키</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              워크플로우를 외부 API로 실행하기 위한 키를 발급하세요.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            style={{ backgroundColor: '#2563eb' }}
            className="hover:bg-[#1d4ed8] text-white transition-all duration-200 hover:scale-[1.03]"
          >
            <Plus className="mr-2 h-4 w-4" />
            새 API 키 생성
          </Button>
        </CardHeader>
        <CardContent>
          <APIKeyList botId={botId} keys={apiKeys} isLoading={isLoading} />
        </CardContent>
      </Card>

      <CreateAPIKeyDialog
        botId={botId}
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={(plainKey) => {
          setCreatedKey(plainKey);
          setShowCreateDialog(false);
        }}
      />

      <APIKeyCreatedDialog
        apiKey={createdKey}
        onClose={() => setCreatedKey(null)}
      />
    </>
  );
}
