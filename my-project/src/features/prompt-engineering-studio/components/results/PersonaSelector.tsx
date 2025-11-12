import { ScrollArea, ScrollBar } from '@shared/components/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/tooltip';
import { cn } from '@shared/utils';

interface Persona {
  id: string;
  name: string;
  text: string;
}

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
}

export function PersonaSelector({
  personas,
  selectedPersonaId,
  onSelectPersona,
}: PersonaSelectorProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center space-x-2 pb-2">
          <TooltipProvider delayDuration={100}>
            {personas.map((persona) => (
              <Tooltip key={persona.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectPersona(persona.id)}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-full border transition-colors duration-200 flex-shrink-0',
                      selectedPersonaId === persona.id
                        ? 'bg-teal-400 text-gray-900 border-teal-400'
                        : 'bg-gray-800/50 border-white/20 hover:bg-gray-700/70 text-white'
                    )}
                  >
                    {persona.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm whitespace-normal bg-gray-900 text-white border-teal-500">
                  <p className="font-bold text-base mb-2 text-teal-400">{persona.name}</p>
                  <p className="text-sm">{persona.text}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
