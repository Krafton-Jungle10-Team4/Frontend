import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { ExternalLink } from 'lucide-react';
import { PUBLIC_API_BASE_URL } from '@/shared/constants/apiEndpoints';

export function APIEndpointSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">API 엔드포인트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Base URL</p>
          <code className="px-2 py-1.5 bg-gray-100 rounded text-xs block text-gray-700 font-normal">
            {PUBLIC_API_BASE_URL}
          </code>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">워크플로우 실행</p>
          <code className="px-2 py-1.5 bg-gray-100 rounded text-xs block text-gray-700 font-normal">
            POST {PUBLIC_API_BASE_URL}/workflows/run
          </code>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:scale-[1.03]"
            onClick={() =>
              window.open('https://docs.snapagent.com/api', '_blank')
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            API 문서 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
