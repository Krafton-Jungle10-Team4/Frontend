import { Prompt } from '../types/testSet';
import { cn } from '@shared/utils/cn';

interface PromptNavigationProps {
  prompts: Prompt[];
  selectedPromptId: string | null;
  onSelect: (id: string) => void;
}

export function PromptNavigation({ prompts, selectedPromptId, onSelect }: PromptNavigationProps) {
  
  const calculateAverageScore = (prompt: Prompt) => {
    const totalScores = prompt.modelResults.reduce((sum, result) => sum + result.averageScore, 0);
    const average = totalScores / prompt.modelResults.length;
    return average.toFixed(1);
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">프롬프트 목록</h3>
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt.id)}
            className={cn(
              'w-full text-left p-3 rounded-md transition-colors',
              'hover:bg-white/10',
              selectedPromptId === prompt.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300'
            )}
          >
            <p className="font-semibold whitespace-pre-wrap break-words text-sm">{prompt.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              평균 점수: {calculateAverageScore(prompt)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
