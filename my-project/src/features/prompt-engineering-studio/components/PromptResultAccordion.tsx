import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/accordion';
import { PromptResult } from '../types/testSet';
import { ModelResultAccordion } from './ModelResultAccordion';
import { FileText } from 'lucide-react';

interface PromptResultAccordionProps {
  promptResult: PromptResult;
}

export function PromptResultAccordion({ promptResult }: PromptResultAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={promptResult.id}>
        <AccordionTrigger className="text-md font-semibold bg-black/20 backdrop-blur-md border border-white/20 rounded-md px-4 text-white hover:bg-white/10">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            <span className="truncate">{promptResult.content}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-2">
          {promptResult.modelResults.map((modelResult) => (
            <ModelResultAccordion key={modelResult.id} modelResult={modelResult} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
