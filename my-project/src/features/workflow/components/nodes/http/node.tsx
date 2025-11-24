/**
 * HTTP Node Component
 * HTTP 요청을 전송하는 노드
 */
import type { CommonNodeType } from '@/shared/types/workflow.types';
import { Globe } from 'lucide-react';

interface HttpNodeData extends CommonNodeType {
  method?: string;
  url?: string;
}

export default function HttpNode({ data }: { data: HttpNodeData }) {
  const method = data.method || 'GET';
  const url = data.url || 'URL 미설정';

  const methodColors: Record<string, string> = {
    GET: 'text-blue-700 bg-blue-100',
    POST: 'text-green-700 bg-green-100',
    PUT: 'text-yellow-700 bg-yellow-100',
    DELETE: 'text-red-700 bg-red-100',
    PATCH: 'text-purple-700 bg-purple-100',
  };

  const methodColor = methodColors[method] || 'text-gray-700 bg-gray-100';

  return (
    <div className="p-3">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span
              className={`font-mono font-semibold px-1.5 py-0.5 rounded ${methodColor}`}
            >
              {method}
            </span>
            <span className="text-gray-500 truncate max-w-[150px]">{url}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
