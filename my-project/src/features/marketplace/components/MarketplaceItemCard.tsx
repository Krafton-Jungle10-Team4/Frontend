import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Download, Eye, Star, TrendingUp } from 'lucide-react';
import type { MarketplaceItem } from '../api/marketplaceApi';
import { MarketplaceItemDetailDialog } from './MarketplaceItemDetailDialog';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDetailDialog(true)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{item.display_name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {formatDate(item.published_at)}
              </CardDescription>
            </div>
            {item.category && (
              <Badge variant="outline">{item.category}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {item.description || '설명이 없습니다.'}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{formatNumber(item.download_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatNumber(item.view_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{item.rating_average.toFixed(1)}</span>
            </div>
          </div>

          {/* Workflow Info */}
          {item.workflow_version && (
            <div className="flex gap-3 mt-4 text-xs text-muted-foreground">
              {item.workflow_version.node_count !== undefined && (
                <span>노드: {item.workflow_version.node_count}</span>
              )}
              {item.workflow_version.edge_count !== undefined && (
                <span>엣지: {item.workflow_version.edge_count}</span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailDialog(true);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            상세보기
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-teal-500 hover:bg-teal-600"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: 가져오기 기능 구현
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            가져오기
          </Button>
        </CardFooter>
      </Card>

      {/* Detail Dialog */}
      <MarketplaceItemDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        itemId={item.id}
      />
    </>
  );
}
