import { useState } from 'react';
import { Badge } from '@/shared/components/badge';
import { Download, Eye, Tag as TagIcon } from 'lucide-react';
import type { MarketplaceItem } from '../api/marketplaceApi';
import { MarketplaceItemDetailDialog } from './MarketplaceItemDetailDialog';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  rank?: number; // 사용하지 않음, 하위 호환성 유지
}

export function MarketplaceItemCard({ item }: MarketplaceItemCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);

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
    <>
      <div
        className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group h-[160px] flex flex-col"
        onClick={() => setShowDetailDialog(true)}
      >
        {/* 상단 바 */}
        <div
          className="h-1"
          style={{ backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)' }}
        />

        <div className="px-5 py-3 flex flex-col flex-1">
          {/* 제목 */}
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">
            {item.display_name}
          </h3>

          {/* 날짜 + publisher */}
          <div className="text-xs text-muted-foreground mb-1">
            <span>{formatDate(item.published_at)}</span>
            {item.publisher?.username && (
              <>
                <span> | </span>
                <span>{item.publisher.username}</span>
              </>
            )}
          </div>

          {/* 설명 */}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {item.description.replace(/\s*봇\s*$/, '')}
            </p>
          )}

          {/* 태그 + 통계 */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            {/* 태그 */}
            <div className="flex flex-wrap gap-1">
              {item.tags && item.tags.length > 0 ? (
                <>
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 rounded text-gray-600"
                    >
                      <TagIcon className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 rounded text-gray-600">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 rounded text-gray-500">
                  <TagIcon className="h-2.5 w-2.5 mr-0.5" />
                  태그 없음
                </Badge>
              )}
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{formatNumber(item.download_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(item.view_count)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketplaceItemDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        itemId={item.id}
      />
    </>
  );
}
