/**
 * Slack Node Component
 * Slack 채널로 메시지를 전송하는 노드
 */
import type { CommonNodeType } from '@/shared/types/workflow.types';
import SlackMessageIcon from '@/features/workflow/components/icons/SlackMessage';

interface SlackNodeData extends CommonNodeType {
  channel?: string;
  use_blocks?: boolean;
}

export default function SlackNode({ data }: { data: SlackNodeData }) {
  const channel = data.channel || '채널 미설정';

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center gap-2 text-sm">
        <SlackMessageIcon className="w-4 h-4 text-fuchsia-700" />
        <span className="font-medium">Slack 메시지</span>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">채널:</span>
          <span className="font-mono bg-gray-100 px-1 rounded">
            {channel}
          </span>
        </div>
        {data.use_blocks && (
          <div className="text-gray-500">
            블록 포맷 사용
          </div>
        )}
      </div>
    </div>
  );
}
