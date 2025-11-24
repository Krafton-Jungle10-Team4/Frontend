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
        className="relative bg-white/80 border border-white/70 rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(55,53,195,0.08)] hover:shadow-[0_20px_60px_rgba(55,53,195,0.16)] hover:-translate-y-2 transition-all duration-300 cursor-pointer group h-[200px] flex flex-col backdrop-blur-xl"
        onClick={() => setShowDetailDialog(true)}
      >
        {/* 상단 바 */}
        <div
          className="h-1.5 bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff]"
        />

        <div className="px-5 py-4 flex flex-col flex-1">
          {/* 봇 이름 */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2">
            {item.display_name}
          </h3>

          {/* 설명 */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.description.replace(/\s*서비스\s*$/, '')}
            </p>
          )}

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags && item.tags.length > 0 ? (
              <>
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700">
                <TagIcon className="h-3 w-3 mr-1" />
                태그 없음
              </Badge>
            )}
          </div>

          {/* 게시자 및 통계 */}
          <div className="flex items-center justify-between mt-auto">
            {/* 게시자 */}
            <div className="text-xs text-gray-600 flex items-center gap-1">
              {item.publisher?.username ? (
                <>
                  <span className="font-medium text-gray-800">작성자:</span>
                  <span>{item.publisher.username}</span>
                </>
              ) : (
                <span className="text-gray-400">작성자 정보 없음</span>
              )}
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#3735c3]" />
                <span>{formatNumber(item.download_count)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#3735c3]" />
                <span>{formatNumber(item.view_count)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
            <span>업데이트 {formatDate(item.updated_at || item.published_at)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailDialog(true);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-[#3735c3]/10 px-3 py-1 text-xs font-semibold text-[#3735c3] transition hover:bg-[#3735c3]/15 hover:shadow-[0_10px_24px_rgba(55,53,195,0.18)]"
            >
              자세히 보기
            </button>
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
