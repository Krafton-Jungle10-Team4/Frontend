import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import type { Template } from '@/data/mockTemplates';

interface TemplateCardProps {
  template: Template;
  onClick: (templateId: string) => void;
  language: 'en' | 'ko';
}

export function TemplateCard({ template, onClick, language }: TemplateCardProps) {
  return (
    <Card
      className="h-[200px] cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onClick(template.id)}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl flex-shrink-0">{template.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {template.name}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-auto line-clamp-2 flex-1">
          {template.description}
        </p>

        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
          <span className="text-xs text-muted-foreground truncate">
            {template.author}
          </span>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {template.type === 'workflow' && (language === 'ko' ? '워크플로우' : 'Workflow')}
            {template.type === 'chatbot' && (language === 'ko' ? '챗봇' : 'Chatbot')}
            {template.type === 'agent' && (language === 'ko' ? '에이전트' : 'Agent')}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
