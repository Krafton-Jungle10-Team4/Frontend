import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/badge';
import { cn } from '@/shared/components/utils';
import { Download, Eye, Tag as TagIcon, Clock } from 'lucide-react';
import {
  getWorkflowIcon,
  getWorkflowIconBackground,
  getWorkflowIconColor,
} from '@/features/studio/constants/tagIcons';
import { MarketplaceItemDetailDialog } from './MarketplaceItemDetailDialog';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import type { MarketplaceItem } from '../api/marketplaceApi';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  rank?: number; // 사용하지 않음, 하위 호환성 유지
}

export function MarketplaceItemCard({ item }: MarketplaceItemCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [itemData, setItemData] = useState<MarketplaceItem>(item);
  const linkedWorkflow = useWorkflowStore((state) =>
    item.workflow_version?.bot_id
      ? state.workflows.find((w) => w.id === item.workflow_version?.bot_id)
      : undefined
  );

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

  useEffect(() => {
    setItemData(item);
  }, [item]);

  useEffect(() => {
    if (!linkedWorkflow) return;

    const next: Partial<MarketplaceItem> = {};

    if (linkedWorkflow.name && linkedWorkflow.name !== itemData.display_name) {
      next.display_name = linkedWorkflow.name;
    }

    if (linkedWorkflow.description && linkedWorkflow.description !== itemData.description) {
      next.description = linkedWorkflow.description;
    }

    const workflowTags = linkedWorkflow.tags || [];
    const hasWorkflowTags = workflowTags.length > 0;
    const tagsMismatch =
      hasWorkflowTags &&
      JSON.stringify(workflowTags) !== JSON.stringify(itemData.tags || []);
    if (tagsMismatch) {
      next.tags = workflowTags;
    }

    if (Object.keys(next).length > 0) {
      setItemData((prev) => ({ ...prev, ...next }));
    }
  }, [linkedWorkflow, itemData.display_name, itemData.description, itemData.tags, itemData.is_active, itemData.status]);

  const handleCloseDetail = () => {
    setShowDetailDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          'group relative bg-white rounded-lg border border-gray-200 p-4',
          'shadow-sm transition-all duration-200 cursor-pointer backdrop-blur',
          'hover:shadow-md hover:-translate-y-1'
        )}
        onClick={() => setShowDetailDialog(true)}
      >
        <div className="flex flex-col flex-1 pt-2">
          <div className="flex justify-between items-start mb-2 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {(() => {
                const IconComponent = getWorkflowIcon(itemData.tags);
                const iconBg = getWorkflowIconBackground(itemData.tags);
                const iconColor = getWorkflowIconColor(itemData.tags);
                return (
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{
                      background: iconBg,
                      borderColor: iconColor + '30',
                    }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-1">
                  {itemData.display_name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span> {formatDate(itemData.updated_at || itemData.published_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {itemData.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 mt-1">
              {itemData.description.replace(/\s*서비스\s*$/, '')}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {itemData.tags && itemData.tags.length > 0 ? (
              <>
                {itemData.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {itemData.tags.length > 3 && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700">
                    +{itemData.tags.length - 3}
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

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#3735c3]" />
                <span> {formatNumber(itemData.download_count)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#3735c3]" />
                <span> {formatNumber(itemData.view_count)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 flex items-center gap-1">
              {itemData.publisher?.username ? (
                <>
                  <span className="font-medium text-gray-800">작성자:</span>
                  <span>{itemData.publisher.username}</span>
                </>
              ) : (
                <span className="text-gray-400">작성자 정보 없음</span>
              )}
            </div>
          </div>

        </div>
      </div>

      <MarketplaceItemDetailDialog
        open={showDetailDialog}
        onClose={handleCloseDetail}
        itemId={item.id}
        onLoaded={(latest) => setItemData(latest)}
      />
    </>
  );
}
