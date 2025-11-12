// src/shared/utils/styleUtils.ts
import { siOpenai, siGooglegemini, siAnthropic } from 'simple-icons';
import { Cpu } from 'lucide-react';
import React from 'react';

/**
 * Model-specific colors for charts and UI elements.
 * This map ensures consistent branding across the application.
 */
const modelColorMap: { [key:string]: string } = {
  'GPT-4o': '#2dd4bf', // GPT (청록색)
  'Claude 3 Sonnet': '#f97316', // Claude (주황색)
  'Gemini 1.5 Pro': '#4285F4', // Gemini (파란색)
};

/**
 * Returns a consistent color for a given AI model name.
 * It performs a case-insensitive search for keywords (gpt, claude, gemini).
 *
 * @param modelName - The name of the AI model (e.g., "GPT-4o", "Claude 3 Sonnet").
 * @returns The corresponding hex color code or a fallback color.
 */
export const getModelColor = (modelName: string): string => {
  if (!modelName) return '#8884d8'; // Return fallback if modelName is null or undefined

  const lowerModelName = modelName.toLowerCase();
  if (lowerModelName.includes('gpt')) return modelColorMap['GPT-4o'];
  if (lowerModelName.includes('claude')) return modelColorMap['Claude 3 Sonnet'];
  if (lowerModelName.includes('gemini')) return modelColorMap['Gemini 1.5 Pro'];

  return '#8884d8'; // Fallback color for unknown models
};

const providerIconMap: Record<string, any> = {
  OpenAI: siOpenai,
  Google: siGooglegemini,
  Anthropic: siAnthropic,
  Unknown: Cpu,
};

export const getProviderIcon = (provider: string) => {
  const iconData = providerIconMap[provider] || providerIconMap.Unknown;
  
  return ({ className }: { className?: string }) => {
    if (iconData.svg) {
      return React.createElement('div', {
        className,
        style: { color: getModelColor(provider) },
        dangerouslySetInnerHTML: {
          __html: iconData.svg.replace('<svg', `<svg fill="currentColor"`),
        },
      });
    }
    return React.createElement(iconData, { className });
  };
};
