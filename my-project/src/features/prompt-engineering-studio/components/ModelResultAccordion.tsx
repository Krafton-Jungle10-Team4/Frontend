import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/accordion';
import { ModelResult } from '../types/testSet';
import { ResponseItemDisplay } from './ResponseItemDisplay';
import { Bot } from 'lucide-react';

interface ModelResultAccordionProps {
  modelResult: ModelResult;
}

export function ModelResultAccordion({ modelResult }: ModelResultAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={modelResult.id}>
        <AccordionTrigger className="bg-gray-800/50 hover:bg-gray-800/80 px-4 rounded-md transition-colors">
          <div className="flex items-center">
            <Bot className="mr-2 h-4 w-4" />
            <span>{modelResult.model}</span>
            <span className="ml-4 text-sm text-primary font-semibold">Avg. {modelResult.averageScore.toFixed(1)}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pt-4">
          {modelResult.responses.map((response) => (
            <ResponseItemDisplay key={response.id} item={response} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
