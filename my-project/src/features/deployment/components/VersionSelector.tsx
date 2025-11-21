/**
 * VersionSelector Component
 * 배포할 워크플로우 버전 선택 UI
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/alert-dialog';
import { Loader2, CheckCircle2, Calendar, GitBranch, Trash2, Eye, EyeOff, History } from 'lucide-react';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import { deploymentApi } from '../api/deploymentApi';
import { toast } from 'sonner';
import type { WorkflowVersionSummary } from '@/features/workflow/types/api.types';
import { VersionHistoryModal } from './VersionHistoryModal';

interface VersionSelectorProps {
  botId: string;
  currentVersionId?: string;
  preSelectedVersionId?: string;
  onDeploySuccess?: () => void;
  widgetKey?: string;
  allowedDomains?: string[];
  botName?: string;
}

export function VersionSelector({
  botId,
  currentVersionId,
  preSelectedVersionId,
  onDeploySuccess,
  widgetKey,
  allowedDomains,
  botName,
}: VersionSelectorProps) {
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWidgetKey, setShowWidgetKey] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 게시된 버전 목록 조회
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoading(true);
        const publishedVersions = await workflowApi.listWorkflowVersions(botId, {
          status: 'published',
        });
        setVersions(publishedVersions);

        console.log('[VersionSelector] preSelectedVersionId:', preSelectedVersionId);
        console.log('[VersionSelector] currentVersionId:', currentVersionId);
        console.log('[VersionSelector] Available versions:', publishedVersions.map(v => ({ id: v.id, version: v.version })));

        // 우선순위: preSelectedVersionId > currentVersionId > 최신 버전
        if (preSelectedVersionId) {
          const foundVersion = publishedVersions.find(v => v.id === preSelectedVersionId);
          console.log('[VersionSelector] Found preselected version:', foundVersion);

          if (foundVersion) {
            setSelectedVersionId(preSelectedVersionId);
            // 배포 후에는 토스트 표시하지 않음 (currentVersionId가 있으면 이미 배포된 상태)
            if (!currentVersionId) {
              toast.success('선택한 버전이 설정되었습니다', {
                id: `version-selected-${botId}-${preSelectedVersionId}`,
                description: '이 버전으로 배포를 진행하세요.',
              });
            }
          } else {
            console.warn('[VersionSelector] preSelectedVersionId not found in versions list');
            // preSelectedVersionId가 목록에 없으면 fallback
            if (currentVersionId) {
              setSelectedVersionId(currentVersionId);
            } else if (publishedVersions.length > 0) {
              setSelectedVersionId(publishedVersions[0].id);
            }
          }
        } else if (currentVersionId) {
          setSelectedVersionId(currentVersionId);
        } else if (publishedVersions.length > 0) {
          // 없으면 최신 버전 선택
          setSelectedVersionId(publishedVersions[0].id);
        }
      } catch (error: any) {
        console.error('Failed to fetch versions:', error);

        // 401 에러인 경우 특별 처리
        if (error.response?.status === 401) {
          toast.error('인증이 만료되었습니다', {
            id: `auth-expired-${botId}`,
            description: '잠시 후 자동으로 로그인 페이지로 이동합니다.',
          });
        } else {
          toast.error('버전 목록 조회 실패', {
            id: `fetch-versions-error-${botId}`,
            description: error.response?.data?.message || '잠시 후 다시 시도해주세요.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [botId, currentVersionId, preSelectedVersionId]);

  // 배포 실행
  const handleDeploy = async () => {
    if (!selectedVersionId) {
      toast.error('배포할 버전을 선택해주세요', {
        id: `deployment-no-version-${botId}`,
      });
      return;
    }

    try {
      setIsDeploying(true);

      const defaultWidgetConfig = {
        theme: 'light' as const,
        position: 'bottom-right' as const,
        auto_open: false,
        primary_color: '#0066FF',
      };

      await deploymentApi.createOrUpdate(botId, {
        workflow_version_id: selectedVersionId,
        status: 'published',
        widget_config: defaultWidgetConfig,
      });

      toast.success('배포 성공', {
        id: `deployment-success-${botId}`,
        description: 'Widget Key가 생성되었습니다.',
      });

      onDeploySuccess?.();
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('배포 실패', {
        id: `deployment-error-${botId}`,
        description: '배포 중 오류가 발생했습니다.',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // 배포 삭제 실행
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deploymentApi.delete(botId);

      toast.success('배포 삭제 완료', {
        id: `deployment-delete-success-${botId}`,
        description: '배포가 성공적으로 삭제되었습니다.',
      });

      setShowDeleteDialog(false);
      onDeploySuccess?.();
    } catch (error) {
      console.error('Deployment delete error:', error);
      toast.error('배포 삭제 실패', {
        id: `deployment-delete-error-${botId}`,
        description: '배포 삭제 중 오류가 발생했습니다.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskWidgetKey = (key: string) => {
    if (!key || key.length <= 3) return key;
    const start = key.slice(0, 3);
    const masked = '*'.repeat(key.length - 3);
    return `${start}${masked}`;
  };

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          버전 목록을 불러오는 중...
        </span>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border p-6 bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          게시된 워크플로우 버전이 없습니다.
          <br />
          워크플로우 빌더에서 "라이브러리에 게시" 버튼을 클릭하여 버전을 생성하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 버전 히스토리 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">배포할 버전 선택</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => setShowVersionHistory(true)}
          >
            <History className="w-4 h-4 mr-2" />
            버전 히스토리
          </Button>
        </div>
      </div>

      {/* 선택된 버전 상세 정보 */}
      {selectedVersion && (
        <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
          {/* 선택된 버전 표시 */}
          <div className="flex items-center gap-2">
            {selectedVersion.id === currentVersionId ? (
              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
                {botName && <span className="font-semibold">{botName}</span>}
                <span className="text-green-600 font-normal">{selectedVersion.version}</span>
                <span className="text-green-600 font-normal ml-1">(운영 중)</span>
              </Badge>
            ) : preSelectedVersionId ? (
              <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-200">
                <span className="font-semibold">선택된 버전:</span>
                <span className="text-blue-600 font-normal">{selectedVersion.version}</span>
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1 bg-gray-100 text-gray-700 border-gray-200">
                <span className="font-semibold">버전:</span>
                <span className="text-gray-600 font-normal">{selectedVersion.version}</span>
              </Badge>
            )}
          </div>

          {/* Widget Key 정보 */}
          {widgetKey && (
            <div className="space-y-2">
              <dt className="text-sm text-muted-foreground">Widget Key</dt>
              <dd className="flex items-center gap-2">
                <code className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {showWidgetKey ? widgetKey : maskWidgetKey(widgetKey)}
                </code>
                <button
                  onClick={() => setShowWidgetKey(!showWidgetKey)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title={showWidgetKey ? '키 숨기기' : '키 보기'}
                >
                  {showWidgetKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </dd>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(selectedVersion.published_at || selectedVersion.created_at)}
            </div>
            {selectedVersion.node_count !== undefined && (
              <span>노드: {selectedVersion.node_count}개</span>
            )}
            {selectedVersion.edge_count !== undefined && (
              <span>연결: {selectedVersion.edge_count}개</span>
            )}
          </div>

          {/* 허용 도메인 정보 */}
          {widgetKey && allowedDomains && (
            <div className="pt-2 border-t space-y-1">
              <dt className="text-sm text-muted-foreground">허용 도메인</dt>
              <dd className="text-sm">
                {allowedDomains.length
                  ? allowedDomains.join(', ')
                  : '모든 도메인 허용'}
              </dd>
            </div>
          )}
        </div>
      )}

      {/* 배포 버튼 */}
      <div className="flex justify-end gap-3">
        {currentVersionId && (
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isDeploying}
            variant="destructive"
            size="lg"
            className="min-w-[120px] rounded-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                배포 삭제
              </>
            )}
          </Button>
        )}
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !selectedVersionId || isDeleting}
          size="lg"
          className="min-w-[200px] rounded-none text-white"
          style={{
            backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
          }}
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              배포 중...
            </>
          ) : selectedVersionId === currentVersionId ? (
            '재배포'
          ) : (
            '이 버전으로 배포'
          )}
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          💡 배포하면 Widget Key가 생성되어 웹사이트 임베드 및 API 연동이 가능해집니다.
        </p>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배포 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              현재 배포를 정말 삭제하시겠습니까?
              <br />
              <br />
              삭제하면 다음 항목이 제거됩니다:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Widget Key 및 임베드 스크립트</li>
                <li>API 엔드포인트 접근 권한</li>
                <li>현재 배포 설정</li>
              </ul>
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-none">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-none"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 버전 히스토리 모달 */}
      <VersionHistoryModal
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        botId={botId}
        currentVersionId={currentVersionId}
        botName={botName}
      />
    </div>
  );
}
