/**
 * TemplateCard - 템플릿 라이브러리 카드
 */
import { memo } from 'react';
import { Download, Eye, User } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/card';
import type { WorkflowTemplate } from '../../../types/template.types';
import { format } from 'date-fns';

interface TemplateCardProps {
  template: WorkflowTemplate;
  onImport: (templateId: string) => void;
}

export const TemplateCard = memo(({ template, onImport }: TemplateCardProps) => {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description || '설명 없음'}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            v{template.version}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{template.author.name}</span>
          </div>
          <div>
            {template.metadata.node_count} 노드 · {template.metadata.edge_count} 연결
          </div>
          <div>{format(new Date(template.created_at), 'yyyy-MM-dd')}</div>
        </div>

        {template.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.metadata.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.metadata.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.metadata.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => {
            // Preview 모달 오픈 로직 (optional)
            // TODO: 템플릿 미리보기 기능 구현 시 추가
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          미리보기
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onImport(template.id)}
        >
          <Download className="w-4 h-4 mr-1" />
          가져오기
        </Button>
      </CardFooter>
    </Card>
  );
});

TemplateCard.displayName = 'TemplateCard';
