/**
 * LLM 모델 선택 드롭다운 컴포넌트
 *
 * 백엔드 API에서 사용 가능한 LLM 모델 목록을 가져와서
 * 드롭다운으로 표시하고 선택할 수 있도록 합니다.
 */

import { useState, useEffect } from 'react';
import { workflowApi } from '../../api/workflowApi';
import type { ModelResponse } from '../../types/api.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';

interface LLMModelSelectProps {
  value?: string;
  onChange: (model: string) => void;
  selectedProvider?: string; // 선택된 provider로 필터링
}

export const LLMModelSelect = ({
  value,
  onChange,
  selectedProvider,
}: LLMModelSelectProps) => {
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelList = await workflowApi.getModels();
        console.log('🔍 [LLMModelSelect] Loaded models:', modelList);
        setModels(modelList);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // provider로 필터링된 모델 목록 (대소문자 구분 없이)
  const filteredModels = selectedProvider
    ? models.filter(
        (model) =>
          model.provider.toLowerCase() === selectedProvider.toLowerCase()
      )
    : models;

  // 디버깅 로그
  console.log('🔍 [LLMModelSelect] selectedProvider:', selectedProvider);
  console.log('🔍 [LLMModelSelect] all models:', models);
  console.log('🔍 [LLMModelSelect] filteredModels:', filteredModels);
  console.log('🔍 [LLMModelSelect] current value:', value);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="text-sm text-gray-500">Loading models...</div>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {filteredModels.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            {selectedProvider
              ? `No models available for ${selectedProvider}`
              : 'No models available'}
          </div>
        ) : (
          filteredModels.map((model) => (
            <SelectItem key={`${model.provider}-${model.id}`} value={model.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                {!selectedProvider && (
                  <span className="text-xs text-gray-500">
                    ({model.provider})
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
