import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/badge';
import { cn } from '@/shared/components/utils';
import { Download, Eye, Tag as TagIcon, Clock, Award, User } from 'lucide-react';
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
  rank?: number; // 1~3이면 다운로드 상위 랭크
}

export function MarketplaceItemCard({ item, rank }: MarketplaceItemCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [itemData, setItemData] = useState<MarketplaceItem>(item);
  const isRanked = typeof rank === 'number' && rank >= 1 && rank <= 3;
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

const medalStyle = (rank?: number) => {
  switch (rank) {
    case 1:
      return {
        bg: '#FFD166',
        text: 'text-amber-900',
        shadow: 'shadow-[0_16px_48px_rgba(255,204,112,0.35)] ring-1 ring-amber-200/80',
        border: 'border-amber-200',
      };
    case 2:
      return {
        bg: '#D8DBE2',
        text: 'text-slate-700',
        shadow: 'shadow-[0_16px_44px_rgba(148,163,184,0.30)] ring-1 ring-slate-200/80',
        border: 'border-slate-200',
      };
    case 3:
      return {
        bg: '#e18b3d',
        text: 'text-orange-900',
        shadow: 'shadow-[0_16px_44px_rgba(225,139,61,0.35)] ring-1 ring-orange-300/90',
        border: 'border-orange-300',
      };
    default:
      return null;
  }
};

  const medal = medalStyle(rank);
  const rankLabel = (() => {
    switch (rank) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      default:
        return 'Top';
    }
  })();
  const rankedHover = (() => {
    switch (rank) {
      case 1:
        return {
          bg: 'hover:bg-amber-50/70',
          border: 'hover:border-amber-200',
          shadow: 'hover:shadow-[0_18px_48px_rgba(255,204,112,0.25)]',
        };
      case 2:
        return {
          bg: 'hover:bg-slate-50/70',
          border: 'hover:border-slate-200',
          shadow: 'hover:shadow-[0_18px_48px_rgba(148,163,184,0.25)]',
        };
      case 3:
        return {
          bg: 'hover:bg-orange-50/70',
          border: 'hover:border-orange-200',
          shadow: 'hover:shadow-[0_18px_48px_rgba(242,166,90,0.25)]',
        };
      default:
        return null;
    }
  })();

  return (
    <>
      <div
        className={cn(
          'group relative bg-white rounded-lg border border-gray-200 p-4',
          'shadow-sm transition-all duration-200 cursor-pointer backdrop-blur',
          isRanked
            ? [
                'hover:-translate-y-1.5',
                rankedHover?.shadow,
                rankedHover?.border,
                rankedHover?.bg,
              ]
            : 'hover:shadow-md hover:-translate-y-1 hover:bg-indigo-50/40 hover:border-indigo-100',
        )}
        onClick={() => setShowDetailDialog(true)}
      >
        {medal && (
          <div
            className={cn(
              'absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-1 shadow-sm',
              medal.text,
              medal.border,
              medal.shadow
            )}
            style={{ backgroundColor: medal.bg }}
          >
            <span className="text-[11px] font-bold">{item.rank}</span>
            <Award className={cn('h-4 w-4', medal.text)} />
            <span className="uppercase tracking-wide">{rankLabel}</span>
          </div>
        )}
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

          <div className="flex flex-wrap gap-1.5 mb-3 justify-end">
            {itemData.tags && itemData.tags.length > 0 ? (
              <>
                {itemData.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-5 rounded-full cursor-default"
                    style={{
                      background: getWorkflowIconBackground([tag]),
                      color: getWorkflowIconColor([tag]),
                      border: `1px solid ${getWorkflowIconColor([tag])}33`,
                    }}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {itemData.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-5 rounded-full cursor-default"
                    style={{
                      background: getWorkflowIconBackground(itemData.tags),
                      color: getWorkflowIconColor(itemData.tags),
                      border: `1px solid ${getWorkflowIconColor(itemData.tags)}33`,
                    }}
                  >
                    +{itemData.tags.length - 3}
                  </Badge>
                )}
              </>
            ) : (
              <Badge
                variant="secondary"
                className="text-[11px] px-2 py-0.5 h-5 rounded-full cursor-default"
                style={{
                  background: getWorkflowIconBackground([]),
                  color: getWorkflowIconColor([]),
                  border: `1px solid ${getWorkflowIconColor([])}33`,
                }}
              >
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
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  <span className="truncate max-w-[110px]" title={itemData.publisher.username}>
                    {itemData.publisher.username}
                  </span>
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
