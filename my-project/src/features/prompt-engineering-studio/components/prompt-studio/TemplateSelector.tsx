/**
 * TemplateSelector Component
 * 프롬프트 템플릿 선택 UI
 */

import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { LayoutTemplate, Plus } from 'lucide-react';
import { TemplateSelectorProps } from '@/features/prompt-engineering-studio/types/prompt';

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onAddCustomTemplate,
}: TemplateSelectorProps) {
  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <LayoutTemplate className="w-5 h-5 text-teal-400" />
        <h3 className="text-white text-lg">프롬프트 템플릿</h3>
      </div>
      <div className="space-y-2">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${
                  selectedTemplate === template.id
                    ? 'bg-teal-500/20 border-teal-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-teal-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-sm mb-1">{template.name}</p>
                  <p className="text-xs text-white/60">{template.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {onAddCustomTemplate && (
        <Button
          className="w-full mt-4 !text-white hover:!text-white"
          variant="outline"
          onClick={onAddCustomTemplate}
        >
          <Plus className="w-4 h-4 mr-2" />
          커스텀 템플릿 추가
        </Button>
      )}
    </Card>
  );
}
