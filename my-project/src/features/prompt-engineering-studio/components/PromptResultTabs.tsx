import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/tabs';
import { PromptResult } from '../types/testSet';
import { ModelResultAccordion } from './ModelResultAccordion';
import { FileText } from 'lucide-react';

interface PromptResultTabsProps {
  promptResults: PromptResult[];
}

export function PromptResultTabs({ promptResults }: PromptResultTabsProps) {
  if (!promptResults || promptResults.length === 0) {
    return <p className="text-gray-400">No detailed results available.</p>;
  }

  return (
    <Tabs defaultValue={promptResults[0].id} className="w-full">
      <TabsList className="border-b border-white/20 w-full justify-start rounded-none bg-transparent p-0">
        {promptResults.map((prompt) => (
          <TabsTrigger
            key={prompt.id}
            value={prompt.id}
            className="bg-transparent p-3 border-b-2 border-transparent text-gray-400 rounded-none data-[state=active]:border-teal-400 data-[state=active]:text-teal-300 data-[state=active]:bg-teal-900/30 hover:text-white truncate flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{prompt.content}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {promptResults.map((prompt) => (
        <TabsContent key={prompt.id} value={prompt.id} className="mt-4">
          <div className="space-y-3">
            {prompt.modelResults.map((modelResult) => (
              <ModelResultAccordion
                key={modelResult.id}
                modelResult={modelResult}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
