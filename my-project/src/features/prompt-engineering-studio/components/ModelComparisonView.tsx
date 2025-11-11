import { useState } from 'react';
import { Prompt, TestSet } from '../types/testSet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/accordion';
import { Button } from '@shared/components/button';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { ScoreBar } from './ScoreBar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/components/tooltip';
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

interface ModelComparisonViewProps {
  prompt: Prompt;
  testSet: TestSet;
}

export function ModelComparisonView({ prompt, testSet }: ModelComparisonViewProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleExpandAll = () => {
    setOpenItems(testSet.questions.map((q, index) => `item-${index}`));
  };

  const handleCollapseAll = () => {
    setOpenItems([]);
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          질문별 비교
        </h3>
        <TooltipProvider>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleExpandAll} className="text-gray-400 hover:text-cyan-300">
                  <ChevronsDownUp className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>모두 펼치기</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCollapseAll} className="text-gray-400 hover:text-orange-300">
                  <ChevronsUpDown className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>모두 접기</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
        {testSet.questions.map((question, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {prompt.modelResults.map((result) => {
                  const response = result.responses.find(
                    (r) => r.question === question
                  );
                  if (!response) return null;

                  const modelInfo = mockModels.find(m => m.id.toLowerCase() === result.model.toLowerCase());
                  const provider = modelInfo?.provider;
                  const providerInfo = provider ? providerDetails[provider] : null;

                  return (
                    <div key={result.id} className="p-3 bg-gray-900/50 rounded-md">
                      <div className="flex items-center font-semibold mb-2">
                        {providerInfo && <Icon icon={providerInfo.icon} color={providerInfo.color} className="w-5 h-5 mr-2" />}
                        <span className="text-white">{result.model}</span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap break-words mb-2">
                        {response.answer}
                      </p>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-2">Score: {response.score}</span>
                        <ScoreBar score={response.score} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
