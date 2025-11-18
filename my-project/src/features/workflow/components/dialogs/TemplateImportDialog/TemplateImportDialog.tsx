/**
 * TemplateImportDialog - 템플릿 Import 다이얼로그 + 템플릿 라이브러리
 */
import { memo, useEffect, useState } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/dialog';
import { Input } from '@/shared/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useTemplateStore } from '../../../stores/templateStore';
import { TEMPLATE_CATEGORIES } from '../../../constants/templateDefaults';
import { TemplateCard } from './TemplateCard';
import { useReactFlow } from '@xyflow/react';

export const TemplateImportDialog = memo(() => {
  const { isImportDialogOpen, closeImportDialog, templates, loadTemplates, isLoading } =
    useTemplateStore();

  const { screenToFlowPosition } = useReactFlow();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('');

  // 템플릿 목록 로드
  useEffect(() => {
    if (isImportDialogOpen) {
      // Build filters object with only non-empty values
      const filters = {
        ...(search.trim() && { search: search.trim() }),
        ...(category && { category }),
        ...(visibility && { visibility }),
      };
      loadTemplates(filters);
    }
  }, [isImportDialogOpen, search, category, visibility, loadTemplates]);

  const handleImport = async (templateId: string) => {
    // 캔버스 중앙에 노드 생성
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    await useTemplateStore.getState().importTemplate(templateId, position);
  };

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={closeImportDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>템플릿 라이브러리</DialogTitle>
          <DialogDescription>
            재사용 가능한 워크플로우 템플릿을 가져오세요.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="템플릿 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="전체 카테고리" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={visibility || undefined} onValueChange={setVisibility}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="전체 공개범위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">비공개</SelectItem>
              <SelectItem value="team">팀 공유</SelectItem>
              <SelectItem value="public">공개</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && templates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>템플릿이 없습니다.</p>
            </div>
          )}

          {!isLoading &&
            templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={handleImport}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

TemplateImportDialog.displayName = 'TemplateImportDialog';
