/**
 * ModelSelector Component
 * AI 모델 선택 UI (Accordion 스타일, 기본 닫힘, 선택된 모델 표시)
 */
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/accordion';
import { DollarSign, Zap, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { ModelSelectorProps, ModelConfig } from '@/features/prompt-engineering-studio/types/prompt';
import { useMemo } from 'react';
import { siOpenai, siGooglegemini, siAnthropic } from 'simple-icons';
import { getModelColor } from '@shared/utils/styleUtils';

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

export function ModelSelector({
  models,
  selectedModels,
  onToggleModel,
}: ModelSelectorProps) {
  const modelsByProvider = useMemo(() => {
    return models.reduce((acc, model) => {
      (acc[model.provider] = acc[model.provider] || []).push(model);
      return acc;
    }, {} as Record<ModelConfig['provider'], ModelConfig[]>);
  }, [models]);

  const providers = Object.keys(modelsByProvider) as ModelConfig['provider'][];

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
<div className="flex items-center gap-2">
          <Cpu className="size-5 text-blue-400" />
          <h3 className="text-white text-lg">AI 모델 선택</h3>
        </div>
      
      <Accordion type="multiple" className="w-full">
        {providers.map(provider => {
          const selectedProviderModels = modelsByProvider[provider].filter(model => selectedModels.includes(model.id));
          const details = providerDetails[provider];

          return (
            <AccordionItem key={provider} value={provider} className="border-white/10">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex justify-between items-center w-full pr-2">
                  <div className="flex items-center gap-3">
                    <Icon icon={details.icon} color={details.color} className="w-6 h-6" />
                    <span className="font-semibold">{details.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProviderModels.map(model => (
                      <Badge key={model.id} variant="default" style={{ backgroundColor: getModelColor(model.name) }}>
                        {model.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modelsByProvider[provider].map((model) => {
                    const isSelected = selectedModels.includes(model.id);
                    const modelColor = getModelColor(model.name);
                    
                    return (
                      <div
                        key={model.id}
                        onClick={() => onToggleModel(model.id)}
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all
                          ${
                            isSelected
                              ? 'border-transparent'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }
                        `}
                        style={{
                          backgroundColor: isSelected ? `${modelColor}20` : undefined, // 20 for opacity
                          borderColor: isSelected ? `${modelColor}80` : undefined, // 80 for opacity
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white mb-1">{model.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                <DollarSign className="w-3 h-3" />
                                {model.price}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                <Zap className="w-3 h-3" />
                                {model.speed}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5" style={{ color: modelColor }} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-white/60">품질:</span>
                          <span className="text-xs text-white">{model.quality}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
        <p className="text-xs text-white/80">
          여러 모델 선택 시 동시에 테스트하여 결과를 비교할 수 있습니다.
        </p>
      </div>
    </Card>
  );
}
