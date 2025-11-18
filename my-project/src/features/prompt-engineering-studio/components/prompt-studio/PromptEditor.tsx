import { Button } from '@/shared/components/button';
import { Textarea } from '@/shared/components/textarea';
import { FilePenLine, Sparkles, Loader2, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import {
  PromptEditorProps,
} from '@/features/prompt-engineering-studio/types/prompt';

export function PromptEditor({
  selectedTemplate,
  templates,
  promptText,
  onPromptTextChange,
  onRefine,
  isRefining,
  refineDisabled,
  onSelectTemplate,
}: Omit<PromptEditorProps, 'questions' | 'onQuestionsChange'> & {
  onRefine: () => void;
  isRefining: boolean;
  refineDisabled: boolean;
  onSelectTemplate: (id: string | null) => void;
}) {
  return (
    <div>
      {/* Compact Template Selector */}
      <div className="mb-4">
        <h4 className="text-md text-gray-300 mb-2">프롬프트 템플릿 (선택)</h4>
        <div className="flex gap-2 flex-wrap">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() =>
                onSelectTemplate(
                  template.id === selectedTemplate ? null : template.id,
                )
              }
              className={`p-3 border rounded-lg transition-colors text-sm flex flex-col items-center justify-center h-24 w-24
                ${
                  selectedTemplate === template.id
                    ? 'bg-teal-500/30 border-teal-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
            >
              <FileText
                className={`size-6 mb-1 ${
                  selectedTemplate === template.id
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              />
              <span
                className={
                  selectedTemplate === template.id
                    ? 'text-white font-semibold'
                    : 'text-gray-300'
                }
              >
                {template.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilePenLine className="size-5 text-teal-400" />
          <h3 className="text-white text-lg">프롬프트 에디터</h3>
        </div>
      </div>

      <div>
        <div className="flex justify-end mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefine}
                disabled={isRefining || refineDisabled}
                className="text-teal-400 hover:bg-white/10 hover:text-teal-300"
              >
                {isRefining ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refine Prompt</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          placeholder="프롬프트를 입력하거나 템플릿을 선택하세요..."
          value={promptText}
          onChange={(e) => onPromptTextChange(e.target.value)}
          className="w-full min-h-[200px] bg-black/30 border-white/10 text-white placeholder:text-white/40 font-mono text-sm"
        />
      </div>

      {/* Prompt Tips */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-xs text-white/80">
            <p className="mb-1">💡 프롬프트 최적화 팁:</p>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>구체적이고 명확한 지시사항을 제공하세요</li>
              <li>원하는 출력 형식을 명시하세요</li>
              <li>Few-shot 예시로 품질을 향상시키세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
