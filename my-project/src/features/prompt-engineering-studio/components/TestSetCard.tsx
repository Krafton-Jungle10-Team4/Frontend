import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/card';
import { Button } from '@shared/components/button';
import { TestSet } from '../types/testSet';
import { FileText, Bot, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface TestSetCardProps {
  testSet: TestSet;
}

export function TestSetCard({ testSet }: TestSetCardProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/prompt-studio/test-sets/${testSet.id}`);
  };

  const winnerModelInfo = mockModels.find(m => m.id.toLowerCase() === testSet.winner.model.toLowerCase());
  const winnerProvider = winnerModelInfo?.provider;
  const winnerProviderInfo = winnerProvider ? providerDetails[winnerProvider] : null;

  return (
    <Card className="bg-gray-900/60 border border-transparent hover:border-teal-400/50 transition-all duration-300 hover:scale-105 text-white flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-gray-200">
          {testSet.name}
        </CardTitle>
        <span className="text-sm text-gray-400">{testSet.createdAt}</span>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="space-y-4 flex-grow">
          <div className="flex items-center text-sm text-gray-400">
            <FileText className="mr-2 h-4 w-4" />
            <span>{testSet.prompts.length} Prompts</span>
            <Bot className="mx-2 h-4 w-4" />
            <span>{testSet.models.length} Models</span>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-300">
              <Cpu className="mr-2 h-4 w-4 text-teal-400" />
              System's Winner Combination
            </h4>
            <p className="text-sm text-gray-300 truncate">
              <strong>Prompt:</strong> {testSet.winner.promptContent}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <strong className="text-sm text-gray-300">Model:</strong>
              {winnerProviderInfo && <Icon icon={winnerProviderInfo.icon} color={winnerProviderInfo.color} className="w-4 h-4" />}
              <p className="text-sm text-gray-300">{testSet.winner.model}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleNavigate} variant="default">
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
