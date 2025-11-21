import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Textarea } from '@/shared/components/textarea';
import { Label } from '@/shared/components/label';
import { Badge } from '@/shared/components/badge';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { publishToMarketplace } from '@/features/marketplace/api/marketplaceApi';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { toast } from 'sonner';

interface MarketplacePublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: LibraryAgentVersion;
}

export function MarketplacePublishDialog({
  open,
  onOpenChange,
  agent,
}: MarketplacePublishDialogProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 기본값은 agent의 라이브러리 메타데이터 사용
  const [displayName, setDisplayName] = useState(agent.library_name || '');
  const [description, setDescription] = useState(agent.library_description || '');
  const [category, setCategory] = useState(agent.library_category || '');
  const [tags, setTags] = useState<string[]>(agent.library_tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      await publishToMarketplace({
        workflow_version_id: agent.id,
        display_name: displayName || undefined,
        description: description || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      setIsSuccess(true);
      toast.success('마켓플레이스 게시 완료', {
        description: '이제 모든 사용자가 이 서비스를 검색하고 가져올 수 있습니다.',
      });

      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('마켓플레이스 게시 실패:', error);
      toast.error('게시 실패', {
        description: error.response?.data?.detail || '마켓플레이스 게시 중 오류가 발생했습니다.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            마켓플레이스에 게시
          </DialogTitle>
          <DialogDescription>
            이 워크플로우를 전체 공개 마켓플레이스에 게시합니다. 모든 서비스 사용자가 검색하고 가져올 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-green-600">게시 완료!</p>
            <p className="text-sm text-muted-foreground">
              탐색 탭에서 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* 경고 안내 */}
            <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-blue-900">전체 공개 게시</p>
                <p className="text-blue-700 mt-1">
                  마켓플레이스에 게시하면 모든 사용자가 이 워크플로우를 검색, 조회, 복사할 수 있습니다.
                  민감한 정보나 비공개 로직이 포함되어 있지 않은지 확인해주세요.
                </p>
              </div>
            </div>

            {/* 워크플로우 정보 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">워크플로우 버전:</span>
                <Badge variant="outline">{agent.version}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">노드 수:</span>
                <span>{agent.node_count || 0}개</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">엣지 수:</span>
                <span>{agent.edge_count || 0}개</span>
              </div>
            </div>

            {/* 표시 이름 */}
            <div className="space-y-2">
              <Label htmlFor="display-name">표시 이름</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="마켓플레이스에 표시될 이름"
              />
              <p className="text-xs text-muted-foreground">
                비어있으면 라이브러리 이름이 사용됩니다.
              </p>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 워크플로우가 무엇을 하는지 설명해주세요"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                비어있으면 라이브러리 설명이 사용됩니다.
              </p>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: 챗봇, 자동화, 분석"
              />
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <Label htmlFor="tags">태그</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그 입력 후 Enter"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  추가
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isSuccess && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
              취소
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-brand-gradient hover:opacity-90"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  게시 중...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  마켓플레이스에 게시
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
