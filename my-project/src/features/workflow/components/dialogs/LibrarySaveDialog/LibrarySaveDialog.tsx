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
import { workflowApi } from '../../../api/workflowApi';
import type { WorkflowVersionSummary } from '../../../types/api.types';
import { VersionBadge } from '../../VersionBadge';

interface LibrarySaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (libraryMetadata: LibraryMetadata) => Promise<void>;
  isPublishing?: boolean;
  defaultBotName?: string;
  botId: string;
}

interface FormData {
  library_name: string;
  library_description: string;
  library_category: string;
  library_tags: string;
}

export const LibrarySaveDialog = memo<LibrarySaveDialogProps>(
  ({ open, onOpenChange, onPublish, isPublishing = false, defaultBotName = '', botId }) => {
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
      },
    });

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [publishedVersions, setPublishedVersions] = useState<WorkflowVersionSummary[]>([]);
    const [nextVersion, setNextVersion] = useState<string>('');

    // 게시된 버전 목록 조회
    useEffect(() => {
      if (open && botId) {
        const fetchVersions = async () => {
          try {
            const versions = await workflowApi.listWorkflowVersions(botId, { status: 'published' });
            setPublishedVersions(versions);

            // 다음 버전 계산
            if (versions.length === 0) {
              setNextVersion('v1.0');
            } else {
              const latestVersion = versions[0].version;
              const versionMatch = latestVersion.match(/v(\d+)\.(\d+)/);
              if (versionMatch) {
                const major = parseInt(versionMatch[1], 10);
                const minor = parseInt(versionMatch[2], 10);
                setNextVersion(`v${major}.${minor + 1}`);
              } else {
                setNextVersion('v1.0');
              }
            }
          } catch (error) {
            console.error('Failed to fetch versions:', error);
            setPublishedVersions([]);
            setNextVersion('v1.0');
          }
        };
        fetchVersions();
      }
    }, [open, botId]);

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
            <div className="flex items-center gap-2">
              <DialogTitle>{defaultBotName} 버전 커밋</DialogTitle>
              {nextVersion && <VersionBadge version={nextVersion} />}
            </div>
            <DialogDescription>
              에이전트 버전을 커밋하고 스튜디오에 저장합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {/* 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="library_description">
                      설명
                    </Label>
                    <Textarea
                      id="library_description"
                      placeholder="현재 버전의 변경점에 대해 설명해주세요 (선택사항)"
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

                  {/* 게시된 버전 목록 */}
                  {publishedVersions.length > 0 && (
                    <div className="space-y-2">
                      <Label>게시된 버전</Label>
                      <div className="flex flex-wrap gap-2">
                        {publishedVersions.map((version) => (
                          <VersionBadge key={version.id} version={version.version} />
                        ))}
                      </div>
                    </div>
                  )}
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
              <Button
                type="submit"
                disabled={isPublishing}
                className="!text-white"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
                }}
              >
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPublishing ? '커밋 중...' : '버전 커밋'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

LibrarySaveDialog.displayName = 'LibrarySaveDialog';
