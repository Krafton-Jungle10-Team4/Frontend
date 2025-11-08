/**
 * 노드 설정 패널 컴포넌트
 *
 * 선택된 노드의 설정을 표시하고 편집할 수 있는 패널입니다.
 * 노드 타입에 따라 다른 설정 폼을 표시합니다.
 */

import { useWorkflowStore } from '../../stores/workflowStore';
import { LLMModelSelect } from './LLMModelSelect';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import { Label } from '@shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import {
  BlockEnum,
  type LLMNodeType,
  type KnowledgeRetrievalNodeType,
} from '@/shared/types/workflow.types';

export const NodeConfigPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  // 이제 조건부 렌더링으로 처리되므로 selectedNodeId는 항상 존재
  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId, { [field]: value });
  };

  const isLLMNode = node.data.type === BlockEnum.LLM;
  const isKnowledgeRetrievalNode =
    node.data.type === BlockEnum.KnowledgeRetrieval;

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold">노드 설정</h3>

      {/* 공통 필드 */}
      <div>
        <Label>제목</Label>
        <Input
          value={node.data.title}
          onChange={(e) => handleUpdate('title', e.target.value)}
        />
      </div>

      <div>
        <Label>설명</Label>
        <Input
          value={node.data.desc}
          onChange={(e) => handleUpdate('desc', e.target.value)}
        />
      </div>

      {/* LLM 노드 전용 */}
      {isLLMNode && (
        <>
          <div>
            <Label>모델</Label>
            <LLMModelSelect
              value={
                typeof (node.data as LLMNodeType).model === 'object'
                  ? (node.data as LLMNodeType).model?.name
                  : (node.data as LLMNodeType).model
              }
              onChange={(modelName) => {
                const currentModel = (node.data as LLMNodeType).model;
                const currentProvider =
                  typeof currentModel === 'object'
                    ? currentModel?.provider
                    : modelName.startsWith('gpt')
                      ? 'OpenAI'
                      : 'Anthropic';

                handleUpdate('model', {
                  provider: currentProvider || 'OpenAI',
                  name: modelName,
                });
              }}
            />
          </div>

          <div>
            <Label>프롬프트</Label>
            <Textarea
              value={(node.data as LLMNodeType).prompt || ''}
              onChange={(e) => handleUpdate('prompt', e.target.value)}
              rows={6}
              placeholder="프롬프트를 입력하세요..."
            />
          </div>

          <div>
            <Label>Temperature</Label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={(node.data as LLMNodeType).temperature || 0.7}
              onChange={(e) =>
                handleUpdate('temperature', parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label>Max Tokens</Label>
            <Input
              type="number"
              min="1"
              max="4096"
              value={(node.data as LLMNodeType).maxTokens || 500}
              onChange={(e) =>
                handleUpdate('maxTokens', parseInt(e.target.value, 10))
              }
            />
          </div>
        </>
      )}

      {/* Knowledge Retrieval 노드 전용 */}
      {isKnowledgeRetrievalNode && (
        <>
          <div>
            <Label>데이터셋</Label>
            <Input
              value={(node.data as KnowledgeRetrievalNodeType).dataset || ''}
              onChange={(e) => handleUpdate('dataset', e.target.value)}
              placeholder="데이터셋 ID를 입력하세요..."
            />
          </div>

          <div>
            <Label>검색 모드</Label>
            <Select
              value={(node.data as KnowledgeRetrievalNodeType).retrievalMode}
              onValueChange={(value) => handleUpdate('retrievalMode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semantic Search">Semantic Search</SelectItem>
                <SelectItem value="Keyword Search">Keyword Search</SelectItem>
                <SelectItem value="Hybrid Search">Hybrid Search</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Top K</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={(node.data as KnowledgeRetrievalNodeType).topK || 5}
              onChange={(e) =>
                handleUpdate('topK', parseInt(e.target.value, 10))
              }
            />
          </div>
        </>
      )}
    </div>
  );
};
