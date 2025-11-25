import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Download, Eye, ThumbsUp, Calendar, User, Workflow, Trash2 } from 'lucide-react';
import { getMarketplaceItem, deleteMarketplaceItem, type MarketplaceItem } from '../api/marketplaceApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';

interface MarketplaceItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  onLoaded?: (item: MarketplaceItem) => void;
}

export function MarketplaceItemDetailDialog({
  open,
  onClose,
  itemId,
  onLoaded,
}: MarketplaceItemDetailDialogProps) {
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const linkedWorkflow = useWorkflowStore((state) =>
    item?.workflow_version?.bot_id
      ? state.workflows.find((w) => w.id === item.workflow_version?.bot_id)
      : undefined
  );
  
  // 현재 사용자가 게시자인지 확인
  const isOwner = item?.publisher?.user_id && currentUser?.uuid && item.publisher.user_id === currentUser.uuid;

  const handleViewAgent = () => {
    if (item?.workflow_version?.bot_id && item?.workflow_version?.id) {
      navigate(`/bot/${item.workflow_version.bot_id}/workflow?mode=readonly&source=marketplace&marketplaceItemId=${item.id}&versionId=${item.workflow_version.id}`);
      onClose();
    }
  };

  const handleImport = async () => {
    if (!item) return;

    const toastId = toast.loading('워크플로우를 가져오는 중...');

    try {
      const { importMarketplaceWorkflow } = await import('../api/marketplaceApi');
      const result = await importMarketplaceWorkflow(item.id);

      toast.success('워크플로우를 내 스튜디오로 가져왔습니다.', { id: toastId });

      onClose();

      // 생성된 봇의 워크플로우 에디터로 직접 이동
      navigate(`/bot/${result.bot_id}/workflow`, {
        state: { botName: result.bot_name }
      });
    } catch (error) {
      console.error('워크플로우 가져오기 실패:', error);
      toast.error('워크플로우 가져오기에 실패했습니다.', { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    if (!confirm('정말로 이 마켓플레이스 아이템을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('삭제 중...');

    try {
      await deleteMarketplaceItem(item.id);
      toast.success('마켓플레이스 아이템이 삭제되었습니다.', { id: toastId });
      onClose();
      // 페이지 새로고침을 위해 window.location.reload() 대신 부모 컴포넌트에서 새로고침하도록 함
      window.location.reload();
    } catch (error: any) {
      console.error('삭제 실패:', error);
      toast.error(
        error.response?.data?.detail || '삭제에 실패했습니다.',
        { id: toastId }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (open && itemId) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const data = await getMarketplaceItem(itemId);
          setItem(data);
          onLoaded?.(data);
        } catch (error) {
          console.error('아이템 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchItem();
    }
  }, [open, itemId]);

  useEffect(() => {
    if (!item || !linkedWorkflow) return;

    const next: Partial<MarketplaceItem> = {};

    if (linkedWorkflow.name && linkedWorkflow.name !== item.display_name) {
      next.display_name = linkedWorkflow.name;
    }
    if (linkedWorkflow.description && linkedWorkflow.description !== item.description) {
      next.description = linkedWorkflow.description;
    }

    const workflowTags = linkedWorkflow.tags || [];
    const hasWorkflowTags = workflowTags.length > 0;
    const tagsMismatch =
      hasWorkflowTags &&
      JSON.stringify(workflowTags) !== JSON.stringify(item.tags || []);
    if (tagsMismatch) {
      next.tags = workflowTags;
    }

    if (linkedWorkflow.deploymentState === 'deployed') {
      if (!item.is_active) next.is_active = true;
      if (item.status !== 'published') next.status = 'published' as MarketplaceItem['status'];
    }

    if (Object.keys(next).length > 0) {
      const merged = { ...item, ...next };
      setItem(merged);
      onLoaded?.(merged);
    }
  }, [item, linkedWorkflow, onLoaded]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : item ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{item.display_name}</DialogTitle>
              <DialogDescription className="mt-2">
                {item.description || '설명이 없습니다.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 서비스 보기 버튼 및 삭제 버튼 */}
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewAgent();
                  }}
                  className="relative flex items-center gap-2 !text-white !bg-blue-700 !border-blue-700 overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-blue-700 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                  <Workflow className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">자세히 보기</span>
                </Button>
                {item.category && (
                  <Badge variant="outline">{item.category}</Badge>
                )}
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                  </Button>
                )}
              </div>

              {/* 태그 */}
              {item.tags && item.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 통계 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-semibold">다운로드</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(item.download_count)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-semibold">조회수</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(item.view_count)}</p>
                </div>
              </div>

              {/* 워크플로우 정보 */}
              {item.workflow_version && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">워크플로우 정보</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">버전:</span>
                      <span className="font-mono">{item.workflow_version.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">노드 수:</span>
                      <span>{item.workflow_version.node_count || 0}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">엣지 수:</span>
                      <span>{item.workflow_version.edge_count || 0}개</span>
                    </div>
                  </div>
                </div>
              )}

              {/* README */}
              {item.readme && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">상세 설명</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{item.readme}</pre>
                  </div>
                </div>
              )}

              {/* 사용 사례 */}
              {item.use_cases && item.use_cases.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">사용 사례</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {item.use_cases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 게시자 및 게시일 정보 */}
              <div className="grid grid-cols-2 gap-4">
                {item.publisher && item.publisher.username && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">게시자</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{item.publisher.username}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">게시일</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center py-12 text-muted-foreground">아이템을 찾을 수 없습니다.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
