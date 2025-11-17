/**
 * TemplateExportDialog - 템플릿 Export 다이얼로그
 */
import { memo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Check, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Label } from '@/shared/components/label';
import { Badge } from '@/shared/components/badge';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { useTemplateStore } from '../../../stores/templateStore';
import { useWorkflowStore } from '../../../stores/workflowStore';
import {
  TEMPLATE_VISIBILITY_OPTIONS,
  TEMPLATE_CATEGORIES,
} from '../../../constants/templateDefaults';
import type { ExportConfig } from '../../../types/template.types';

interface ExportFormData {
  name: string;
  description?: string;
  category?: string;
  tags: string;
  visibility: 'private' | 'team' | 'public';
}

export const TemplateExportDialog = memo(() => {
  const {
    isExportDialogOpen,
    closeExportDialog,
    exportValidation,
    validateExport,
    exportTemplate,
    isLoading,
  } = useTemplateStore();

  const { botId, draftVersionId } = useWorkflowStore();
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExportFormData>({
    defaultValues: {
      visibility: 'private',
      tags: '',
    },
  });

  const selectedVisibility = watch('visibility');

  // 다이얼로그 오픈 시 검증 실행
  useEffect(() => {
    if (isExportDialogOpen && botId && draftVersionId) {
      setIsValidating(true);
      validateExport(botId, draftVersionId).finally(() => {
        setIsValidating(false);
      });
    }
  }, [isExportDialogOpen, botId, draftVersionId, validateExport]);

  const onSubmit = async (data: ExportFormData) => {
    if (!botId || !draftVersionId) return;

    const config: ExportConfig = {
      workflow_id: botId,
      version_id: draftVersionId,
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      visibility: data.visibility,
    };

    try {
      await exportTemplate(config);
      reset();
    } catch (error) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    reset();
    closeExportDialog();
  };

  return (
    <Dialog open={isExportDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿으로 내보내기</DialogTitle>
          <DialogDescription>
            현재 워크플로우를 재사용 가능한 템플릿으로 저장합니다.
          </DialogDescription>
        </DialogHeader>

        {/* Validation Status */}
        {isValidating && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">워크플로우 검증 중...</span>
          </div>
        )}

        {exportValidation && !exportValidation.is_valid && (
          <Alert variant="destructive">
            <X className="w-4 h-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Export 불가</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                {exportValidation.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {exportValidation && exportValidation.is_valid && (
          <Alert>
            <Check className="w-4 h-4 text-green-500" />
            <AlertDescription>
              <p className="font-medium">Export 가능</p>
              <p className="text-xs text-muted-foreground mt-1">
                노드 {exportValidation.node_count}개, 연결{' '}
                {exportValidation.edge_count}개
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {exportValidation?.is_valid && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                템플릿 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', {
                  required: '템플릿 이름은 필수입니다.',
                  maxLength: {
                    value: 200,
                    message: '최대 200자까지 입력 가능합니다.',
                  },
                })}
                placeholder="예: RAG 응답 생성기"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                {...register('description', {
                  maxLength: {
                    value: 1000,
                    message: '최대 1000자까지 입력 가능합니다.',
                  },
                })}
                placeholder="템플릿에 대한 설명을 입력하세요."
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="예: RAG, LLM, 검색"
              />
              <p className="text-xs text-muted-foreground">
                여러 태그는 쉼표(,)로 구분하세요.
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">공개 범위</Label>
              <Select
                value={selectedVisibility}
                onValueChange={(value) =>
                  setValue('visibility', value as 'private' | 'team' | 'public')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_VISIBILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detected Ports Preview */}
            {exportValidation.detected_input_ports.length > 0 ||
            exportValidation.detected_output_ports.length > 0 ? (
              <div className="space-y-2">
                <Label>자동 추출된 포트 스키마</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium mb-2">입력 포트</p>
                    <div className="space-y-1">
                      {exportValidation.detected_input_ports.map((port) => (
                        <div
                          key={port.name}
                          className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                        >
                          <span className="font-mono">{port.name}</span>
                          <Badge variant="outline">{port.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2">출력 포트</p>
                    <div className="space-y-1">
                      {exportValidation.detected_output_ports.map((port) => (
                        <div
                          key={port.name}
                          className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                        >
                          <span className="font-mono">{port.name}</span>
                          <Badge variant="outline">{port.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                템플릿 생성
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
});

TemplateExportDialog.displayName = 'TemplateExportDialog';
