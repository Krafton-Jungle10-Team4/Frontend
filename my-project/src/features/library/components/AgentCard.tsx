import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Download, Rocket, Eye, Plus, History } from 'lucide-react';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { AgentDetailDialog } from './AgentDetailDialog';
import { AgentImportDialog } from './AgentImportDialog';
import { AgentImportAsNodeDialog } from './AgentImportAsNodeDialog';
import { LibraryDeployDialog } from './LibraryDeployDialog';
import { VersionTimelineDialog } from './VersionTimelineDialog';
import { useLibraryStore } from '../stores/libraryStore';

interface AgentCardProps {
  agent: LibraryAgentVersion;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showImportAsNodeDialog, setShowImportAsNodeDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showVersionTimelineDialog, setShowVersionTimelineDialog] = useState(false);

  // Phase 6.2: 배포 상태 동기화
  const { fetchAgents } = useLibraryStore();

  const visibilityLabel = {
    private: '비공개',
    team: '팀',
    public: '공개',
  }[agent.library_visibility];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 배포 상태 배지 렌더링 함수
  const getDeploymentBadge = () => {
    if (!agent.deployment_status) {
      return <Badge variant="outline">배포 안 됨</Badge>;
    }

    switch (agent.deployment_status) {
      case 'published':
        return <Badge className="bg-green-500 text-white">배포됨</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500 text-white">일시중지</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return null;
    }
  };

  // 상대 시간 표시 함수 (date-fns 대체)
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  };

  // Phase 6.2: 배포 성공 시 라이브러리 목록 갱신
  const handleDeploySuccess = () => {
    fetchAgents();
    setShowDeployDialog(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{agent.library_name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {agent.version} • {formatDate(agent.library_published_at)}
              </CardDescription>
            </div>
            <Badge variant="outline">{visibilityLabel}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {agent.library_description || '설명이 없습니다.'}
          </p>

          {/* Category & Tags */}
          <div className="space-y-2">
            {agent.library_category && (
              <Badge variant="secondary">{agent.library_category}</Badge>
            )}
            {agent.library_tags && agent.library_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.library_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Deployment Status Badge & Widget Key */}
          <div className="flex items-center gap-2 mt-4">
            {getDeploymentBadge()}
            {agent.widget_key && (
              <span className="text-xs text-muted-foreground">
                🔑 {agent.widget_key.slice(0, 8)}...
              </span>
            )}
          </div>

          {/* Deployed Date */}
          {agent.deployed_at && (
            <p className="text-xs text-muted-foreground mt-2">
              배포: {formatRelativeTime(agent.deployed_at)}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            {agent.node_count !== undefined && (
              <span>노드: {agent.node_count}</span>
            )}
            {agent.edge_count !== undefined && (
              <span>엣지: {agent.edge_count}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowDetailDialog(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              상세보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowImportDialog(true)}
            >
              <Download className="w-4 h-4 mr-1" />
              에이전트 가져오기
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setShowImportAsNodeDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              노드로 가져오기
            </Button>
          </div>
          <div className="flex gap-2 w-full">
            {!agent.deployment_status ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setShowDeployDialog(true)}
              >
                <Rocket className="w-4 h-4 mr-1" />
                배포
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowDeployDialog(true)}
              >
                <Rocket className="w-4 h-4 mr-1" />
                배포 관리
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setShowVersionTimelineDialog(true)}
            >
              <History className="w-4 h-4 mr-1" />
              버전 보기
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <AgentDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        versionId={agent.id}
      />
      <AgentImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        agent={agent}
      />
      <AgentImportAsNodeDialog
        open={showImportAsNodeDialog}
        onOpenChange={setShowImportAsNodeDialog}
      />
      <LibraryDeployDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        agent={agent}
        onDeploySuccess={handleDeploySuccess}
      />
      <VersionTimelineDialog
        open={showVersionTimelineDialog}
        onOpenChange={setShowVersionTimelineDialog}
        agent={agent}
      />
    </>
  );
}
