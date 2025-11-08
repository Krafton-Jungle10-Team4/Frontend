/**
 * PublishDropdown Component
 * Dify 스타일 게시하기 드롭다운 메뉴
 */

import { useEffect } from 'react';
import { ChevronDown, Play, Code, Compass, FileCode } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';
import { DEPLOYMENT_STATUS_LABELS } from '@/features/deployment/types/deployment';
import { usePublishActions } from '../../hooks/usePublishActions';

interface PublishDropdownProps {
  botId: string;
}

/**
 * 상대 시간 포맷 (예: "3시간 전")
 */
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '정보 없음';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  }
}

/**
 * 배포 상태별 배지 스타일
 */
function getStatusVariant(status: string | null) {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const { deployment, fetchDeployment } = useDeploymentStore();
  const {
    publishUpdate,
    runApp,
    embedWebsite,
    openExplore,
    apiReference,
  } = usePublishActions(botId);

  // 컴포넌트 마운트 시 배포 정보 로드
  useEffect(() => {
    fetchDeployment(botId);
  }, [botId, fetchDeployment]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1.5"
        >
          게시하기
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* 상단: 배포 상태 및 업데이트 버튼 */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getStatusVariant(deployment?.status || null)}>
              {deployment?.status
                ? DEPLOYMENT_STATUS_LABELS[deployment.status]
                : '미배포'}
            </Badge>
            {deployment?.version && (
              <span className="text-xs text-muted-foreground">
                v{deployment.version}
              </span>
            )}
          </div>

          {deployment?.updated_at && (
            <p className="text-xs text-muted-foreground mb-2">
              발행일 {formatRelativeTime(deployment.updated_at)}
            </p>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={publishUpdate}
          >
            업데이트 게시
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* 메뉴 항목들 */}
        <DropdownMenuItem onClick={runApp}>
          <Play className="mr-2 h-4 w-4" />
          앱 실행
        </DropdownMenuItem>

        <DropdownMenuItem onClick={embedWebsite}>
          <Code className="mr-2 h-4 w-4" />
          사이트에 삽입
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplore}>
          <Compass className="mr-2 h-4 w-4" />
          Explore에서 열기
        </DropdownMenuItem>

        <DropdownMenuItem onClick={apiReference}>
          <FileCode className="mr-2 h-4 w-4" />
          API 참조 접근
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
