import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Badge } from '@/shared/components/badge';
import { Download, Eye, Star, Calendar, User } from 'lucide-react';
import { getMarketplaceItem, type MarketplaceItem } from '../api/marketplaceApi';
import { Loader2 } from 'lucide-react';

interface MarketplaceItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
}

export function MarketplaceItemDetailDialog({
  open,
  onClose,
  itemId,
}: MarketplaceItemDetailDialogProps) {
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && itemId) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const data = await getMarketplaceItem(itemId);
          setItem(data);
        } catch (error) {
          console.error('아이템 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchItem();
    }
  }, [open, itemId]);

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
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : item ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{item.display_name}</DialogTitle>
              <DialogDescription>
                {item.description || '설명이 없습니다.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 메타데이터 */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(item.published_at)}</span>
                </div>
                {item.category && (
                  <Badge variant="outline">{item.category}</Badge>
                )}
              </div>

              {/* 태그 */}
              {item.tags && item.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold">다운로드</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{formatNumber(item.download_count)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">조회수</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(item.view_count)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">평점</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {item.rating_average.toFixed(1)}
                    <span className="text-sm text-muted-foreground ml-1">({item.rating_count})</span>
                  </p>
                </div>
              </div>

              {/* 워크플로우 정보 */}
              {item.workflow_version && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">워크플로우 정보</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
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
                  <div className="p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none">
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

              {/* 게시자 정보 */}
              {item.publisher && item.publisher.username && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">게시자</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{item.publisher.username}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-center py-12 text-muted-foreground">아이템을 찾을 수 없습니다.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
