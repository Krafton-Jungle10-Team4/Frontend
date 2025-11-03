import { Button } from '@/shared/components/button';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  return (
    <div className="flex gap-2">
      {models.map((model) => (
        <Button
          key={model}
          variant={selectedModel === model ? "default" : "outline"}
          onClick={() => onSelectModel(model)}
          size="sm"
        >
          {model}
        </Button>
      ))}
    </div>
  );
}
