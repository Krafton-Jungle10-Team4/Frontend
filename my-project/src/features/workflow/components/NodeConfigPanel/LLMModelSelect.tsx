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
}

export const LLMModelSelect = ({ value, onChange }: LLMModelSelectProps) => {
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelList = await workflowApi.getModels();
        setModels(modelList);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

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
        {models.map((model) => (
          <SelectItem key={`${model.provider}-${model.name}`} value={model.name}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{model.display_name}</span>
              <span className="text-xs text-gray-500">({model.provider})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
