import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Download, Eye, Star, TrendingUp, ThumbsUp, Award } from 'lucide-react';
import type { MarketplaceItem } from '../api/marketplaceApi';
import { MarketplaceItemDetailDialog } from './MarketplaceItemDetailDialog';
import { importMarketplaceWorkflow } from '../api/marketplaceApi';
import { toast } from 'sonner';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  rank?: number;
}

export function MarketplaceItemCard({ item, rank }: MarketplaceItemCardProps) {
  const navigate = useNavigate();
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const getMedalIcon = () => {
    if (!rank) return null;

    const medals = {
      1: (
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ribbon - Triangle pointing down */}
          <path d="M9 0 L9 8 L12 11 L9 0 Z" fill="#C62828" />
          <path d="M23 0 L23 8 L20 11 L23 0 Z" fill="#B71C1C" />
          <path d="M12 0 L12 10 L16 13 L20 10 L20 0 Z" fill="#D32F2F" />

          {/* Medal Circle - Outer Ring */}
          <circle cx="16" cy="22" r="12" fill="url(#gold-outer)" />

          {/* Medal Circle - Inner Ring */}
          <circle cx="16" cy="22" r="10.5" fill="url(#gold-main)" />
          <circle cx="16" cy="22" r="10.5" stroke="#B8860B" strokeWidth="0.5" opacity="0.5" />

          {/* Inner Detail Circle */}
          <circle cx="16" cy="22" r="8.5" fill="url(#gold-inner)" opacity="0.3" />

          {/* Number 1 */}
          <text x="16" y="26" fontSize="12" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Arial, sans-serif">1</text>

          <defs>
            <linearGradient id="gold-outer" x1="16" y1="10" x2="16" y2="34">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#C5A028" />
              <stop offset="100%" stopColor="#A0841A" />
            </linearGradient>
            <linearGradient id="gold-main" x1="16" y1="11.5" x2="16" y2="32.5">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="30%" stopColor="#DAAA00" />
              <stop offset="70%" stopColor="#C5A028" />
              <stop offset="100%" stopColor="#AA8C1B" />
            </linearGradient>
            <linearGradient id="gold-inner" x1="16" y1="13.5" x2="16" y2="30.5">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
      ),
      2: (
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ribbon - Triangle pointing down */}
          <path d="M9 0 L9 8 L12 11 L9 0 Z" fill="#C62828" />
          <path d="M23 0 L23 8 L20 11 L23 0 Z" fill="#B71C1C" />
          <path d="M12 0 L12 10 L16 13 L20 10 L20 0 Z" fill="#D32F2F" />

          {/* Medal Circle - Outer Ring */}
          <circle cx="16" cy="22" r="12" fill="url(#silver-outer)" />

          {/* Medal Circle - Inner Ring */}
          <circle cx="16" cy="22" r="10.5" fill="url(#silver-main)" />
          <circle cx="16" cy="22" r="10.5" stroke="#909090" strokeWidth="0.5" opacity="0.5" />

          {/* Inner Detail Circle */}
          <circle cx="16" cy="22" r="8.5" fill="url(#silver-inner)" opacity="0.3" />

          {/* Number 2 */}
          <text x="16" y="26" fontSize="12" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Arial, sans-serif">2</text>

          <defs>
            <linearGradient id="silver-outer" x1="16" y1="10" x2="16" y2="34">
              <stop offset="0%" stopColor="#BDBDBD" />
              <stop offset="50%" stopColor="#9E9E9E" />
              <stop offset="100%" stopColor="#757575" />
            </linearGradient>
            <linearGradient id="silver-main" x1="16" y1="11.5" x2="16" y2="32.5">
              <stop offset="0%" stopColor="#D5D5D5" />
              <stop offset="30%" stopColor="#B8B8B8" />
              <stop offset="70%" stopColor="#9E9E9E" />
              <stop offset="100%" stopColor="#858585" />
            </linearGradient>
            <linearGradient id="silver-inner" x1="16" y1="13.5" x2="16" y2="30.5">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="100%" stopColor="#AAAAAA" />
            </linearGradient>
          </defs>
        </svg>
      ),
      3: (
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ribbon - Triangle pointing down */}
          <path d="M9 0 L9 8 L12 11 L9 0 Z" fill="#C62828" />
          <path d="M23 0 L23 8 L20 11 L23 0 Z" fill="#B71C1C" />
          <path d="M12 0 L12 10 L16 13 L20 10 L20 0 Z" fill="#D32F2F" />

          {/* Medal Circle - Outer Ring */}
          <circle cx="16" cy="22" r="12" fill="url(#bronze-outer)" />

          {/* Medal Circle - Inner Ring */}
          <circle cx="16" cy="22" r="10.5" fill="url(#bronze-main)" />
          <circle cx="16" cy="22" r="10.5" stroke="#8B4513" strokeWidth="0.5" opacity="0.5" />

          {/* Inner Detail Circle */}
          <circle cx="16" cy="22" r="8.5" fill="url(#bronze-inner)" opacity="0.3" />

          {/* Number 3 */}
          <text x="16" y="26" fontSize="12" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Arial, sans-serif">3</text>

          <defs>
            <linearGradient id="bronze-outer" x1="16" y1="10" x2="16" y2="34">
              <stop offset="0%" stopColor="#D4A574" />
              <stop offset="50%" stopColor="#B87333" />
              <stop offset="100%" stopColor="#8B5A2B" />
            </linearGradient>
            <linearGradient id="bronze-main" x1="16" y1="11.5" x2="16" y2="32.5">
              <stop offset="0%" stopColor="#E6C196" />
              <stop offset="30%" stopColor="#CD7F32" />
              <stop offset="70%" stopColor="#B87333" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
            <linearGradient id="bronze-inner" x1="16" y1="13.5" x2="16" y2="30.5">
              <stop offset="0%" stopColor="#E6C196" />
              <stop offset="100%" stopColor="#CD7F32" />
            </linearGradient>
          </defs>
        </svg>
      ),
    };

    return medals[rank as keyof typeof medals];
  };

  const handleImport = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isImporting) return;

    const toastId = toast.loading('워크플로우를 가져오는 중...');

    try {
      setIsImporting(true);

      const result = await importMarketplaceWorkflow(item.id);

      toast.success('워크플로우를 내 스튜디오로 가져왔습니다.', { id: toastId });

      navigate('/workspace/studio');
    } catch (error) {
      console.error('워크플로우 가져오기 실패:', error);
      toast.error('워크플로우 가져오기에 실패했습니다.', { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

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
      <Card className={`relative overflow-hidden shadow-lg hover:shadow-xl ${rank ? 'hover:scale-[1.04]' : 'hover:scale-[1.02]'} transition-all duration-200 cursor-pointer rounded-none border border-gray-200 bg-gradient-to-br from-blue-50 to-white`} onClick={() => setShowDetailDialog(true)}>
        <div className="h-1" style={{ backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)' }} />
        <CardHeader className="pt-2 pb-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              {rank && getMedalIcon()}
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt={item.display_name}
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <CardTitle className={rank ? 'text-2xl font-extrabold' : 'text-xl font-bold'}>{item.display_name}</CardTitle>
            </div>
            {item.category && (
              <Badge variant="outline">{item.category}</Badge>
            )}
          </div>
          <div className={`flex items-center gap-2 text-xs text-muted-foreground ${rank ? 'font-semibold' : ''}`}>
            <span>{formatDate(item.published_at)}</span>
            {item.publisher?.username && (
              <>
                <span>|</span>
                <span>{item.publisher.username}</span>
              </>
            )}
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags && item.tags.length > 0 ? (
              <>
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    className="text-xs text-white border-0"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge
                    className="text-xs text-white border-0"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
                    }}
                  >
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                태그 없음
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 -mt-2">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {(item.description || '설명이 없습니다.').replace(/\s*봇\s*$/, '')}
          </p>

          {/* Stats in White Box */}
          <div className="bg-white rounded-none p-3">
            {/* Stats */}
            <div className="flex justify-between text-xs text-muted-foreground">
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
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{formatNumber(item.rating_count)}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-none"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailDialog(true);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            상세보기
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 rounded-none ${rank ? 'bg-gradient-to-r from-black to-blue-600 text-white hover:from-gray-900 hover:to-blue-700 border-0' : ''}`}
            onClick={handleImport}
            disabled={isImporting}
          >
            <Download className="w-4 h-4 mr-1" />
            {isImporting ? '가져오는 중...' : '가져오기'}
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
