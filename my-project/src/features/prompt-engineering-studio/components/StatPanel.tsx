import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Cpu, User } from 'lucide-react';
import { TestSet } from '../types/testSet';
import { RadialProgress } from './RadialProgress';
import { siOpenai, siGooglegemini, siAnthropic } from 'simple-icons';
import { mockModels } from '../data/mockModels';

// 로고 렌더링을 위한 헬퍼
const providerDetails = {
  OpenAI: { name: 'ChatGPT', icon: siOpenai, color: '#FFFFFF' },
  Google: { name: 'Gemini', icon: siGooglegemini, color: '#8AB4F8' },
  Anthropic: { name: 'Claude', icon: siAnthropic, color: '#D97706' },
};

const Icon = ({ icon, color, className }: { icon: { svg: string }, color: string, className?: string }) => (
  <div
    className={className}
    style={{ color }}
    dangerouslySetInnerHTML={{ __html: icon.svg.replace('<svg', `<svg fill="${color}"`) }}
  />
);

interface StatPanelProps {
  type: 'winner' | 'selection';
  testSet: TestSet;
}

export function StatPanel({ type, testSet }: StatPanelProps) {
  const isWinner = type === 'winner';
  const data = isWinner ? testSet.winner : testSet.userSelection;

  if (!data) {
    return null;
  }

  const modelInfo = mockModels.find(m => m.id.toLowerCase() === data.model.toLowerCase());
  const provider = modelInfo?.provider;
  const providerInfo = provider ? providerDetails[provider] : null;

  const TitleIcon = isWinner ? Cpu : User;
  const borderColor = isWinner ? 'border-cyan-400' : 'border-blue-400';
  const title = isWinner ? "시스템 추천" : "나의 선택";

  const avgScore = testSet.prompts
    .find((p) => p.content === data.promptContent)
    ?.modelResults.find((m) => m.model === data.model)?.averageScore;

  return (
    <Card className={`bg-black/20 backdrop-blur-md border ${borderColor} text-white`}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-gray-200">
          <TitleIcon className={`mr-2 h-5 w-5 ${isWinner ? 'text-cyan-400' : 'text-blue-400'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Model</p>
            <div className="flex items-center gap-2 mt-1">
              {providerInfo && <Icon icon={providerInfo.icon} color={providerInfo.color} className="w-5 h-5" />}
              <p className="text-lg font-semibold">{data.model}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">평균 점수</p>
            <div className="flex items-center gap-2">
              <RadialProgress value={avgScore || 0} />
              <p className="text-2xl font-bold text-white">{(avgScore || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm text-gray-400 font-semibold mb-1">Prompt</h4>
          <div className="p-3 bg-black/20 rounded-md">
            <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
              {data.promptContent}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
