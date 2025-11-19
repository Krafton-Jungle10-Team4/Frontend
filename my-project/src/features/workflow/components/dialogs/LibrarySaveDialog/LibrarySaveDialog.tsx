/**
 * LibrarySaveDialog - 워크플로우 발행 및 라이브러리 저장 다이얼로그
 */
import { memo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Textarea } from '@/shared/components/textarea';
import { Label } from '@/shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Badge } from '@/shared/components/badge';
import { TEMPLATE_CATEGORIES } from '../../../constants/templateDefaults';
import type { LibraryMetadata } from '../../../types/workflow.types';

interface LibrarySaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (libraryMetadata: LibraryMetadata) => Promise<void>;
  isPublishing?: boolean;
  defaultBotName?: string;
}

interface FormData {
  library_name: string;
  library_description: string;
  library_category: string;
  library_tags: string;
  library_visibility: 'private' | 'team' | 'public';
}

export const LibrarySaveDialog = memo<LibrarySaveDialogProps>(
  ({ open, onOpenChange, onPublish, isPublishing = false, defaultBotName = '' }) => {
    const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
      reset,
    } = useForm<FormData>({
      defaultValues: {
        library_name: defaultBotName,
        library_description: '',
        library_category: '',
        library_tags: '',
        library_visibility: 'team',
      },
    });

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // defaultBotName이 변경되면 폼의 library_name 업데이트
    useEffect(() => {
      if (defaultBotName) {
        setValue('library_name', defaultBotName);
      }
    }, [defaultBotName, setValue]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        if (!tags.includes(tagInput.trim())) {
          const newTags = [...tags, tagInput.trim()];
          setTags(newTags);
          setValue('library_tags', newTags.join(','));
        }
        setTagInput('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      setValue('library_tags', newTags.join(','));
    };

    const onSubmit = async (data: FormData) => {
      try {
        const libraryMetadata: LibraryMetadata = {
          library_name: data.library_name,
          library_description: data.library_description,
          library_category: data.library_category,
          library_tags: tags,
          library_visibility: data.library_visibility,
        };
        await onPublish(libraryMetadata);

        // 성공 시 폼 리셋
        reset();
        setTags([]);
        setTagInput('');
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to publish workflow:', error);
      }
    };

    const handleCancel = () => {
      reset();
      setTags([]);
      setTagInput('');
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>에이전트 버전 게시</DialogTitle>
            <DialogDescription>
              에이전트 버전을 게시하고 라이브러리에 저장합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {/* 라이브러리 이름 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_name">
                      이름 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="library_name"
                      placeholder="예: 고객 문의 응답 에이전트"
                      {...register('library_name', {
                        required: '이름을 입력해주세요',
                        minLength: {
                          value: 2,
                          message: '이름은 최소 2자 이상이어야 합니다',
                        },
                        maxLength: {
                          value: 100,
                          message: '이름은 최대 100자까지 입력 가능합니다',
                        },
                      })}
                    />
                    {errors.library_name && (
                      <p className="text-sm text-destructive">
                        {errors.library_name.message}
                      </p>
                    )}
                  </div>

                  {/* 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_description">
                      설명
                    </Label>
                    <Textarea
                      id="library_description"
                      placeholder="에이전트의 기능과 사용 방법을 설명해주세요 (선택사항)"
                      rows={3}
                      {...register('library_description', {
                        maxLength: {
                          value: 500,
                          message: '설명은 최대 500자까지 입력 가능합니다',
                        },
                      })}
                    />
                    {errors.library_description && (
                      <p className="text-sm text-destructive">
                        {errors.library_description.message}
                      </p>
                    )}
                  </div>

                  {/* 카테고리 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_category">
                      카테고리 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('library_category')}
                      onValueChange={(value) => setValue('library_category', value)}
                    >
                      <SelectTrigger id="library_category">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.library_category && (
                      <p className="text-sm text-destructive">
                        {errors.library_category.message}
                      </p>
                    )}
                  </div>

                  {/* 태그 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_tags">태그</Label>
                    <Input
                      id="library_tags"
                      placeholder="태그 입력 후 Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
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
                    <p className="text-xs text-muted-foreground">
                      Enter 키로 태그 추가, 클릭하여 제거
                    </p>
                  </div>

                  {/* 공개 범위 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_visibility">
                      공개 범위 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watch('library_visibility')}
                      onValueChange={(value: 'private' | 'team' | 'public') =>
                        setValue('library_visibility', value)
                      }
                    >
                      <SelectTrigger id="library_visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          비공개 - 나만 사용
                        </SelectItem>
                        <SelectItem value="team">
                          팀 공유 - 팀원에게 공개
                        </SelectItem>
                        <SelectItem value="public">
                          공개 - 모든 사용자에게 공개
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.library_visibility && (
                      <p className="text-sm text-destructive">
                        {errors.library_visibility.message}
                      </p>
                    )}
                  </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPublishing}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPublishing}>
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPublishing ? '게시 중...' : '라이브러리에 게시'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

LibrarySaveDialog.displayName = 'LibrarySaveDialog';
