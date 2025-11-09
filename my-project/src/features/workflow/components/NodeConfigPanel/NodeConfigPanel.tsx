/**
 * 노드 설정 패널 컴포넌트
 *
 * 선택된 노드의 설정을 표시하고 편집할 수 있는 패널입니다.
 * 노드 타입에 따라 다른 설정 폼을 표시합니다.
 */

import { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useDocumentStore } from '@/features/documents/stores/documentStore';
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
import { MultiSelect } from '@shared/components/multi-select';
import { X } from 'lucide-react';
import {
  BlockEnum,
  type LLMNodeType,
  type KnowledgeRetrievalNodeType,
} from '@/shared/types/workflow.types';
import BlockIcon from '../nodes/_base/block-icon';

export const NodeConfigPanel = () => {
  const { selectedNodeId, nodes, updateNode, selectNode } = useWorkflowStore();
  const { documents } = useDocumentStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Hook은 항상 최상단에서 호출 (조건부 return 이전)
  const node = nodes.find((n) => n.id === selectedNodeId);
  const isLLMNode = node?.data.type === BlockEnum.LLM;
  const isKnowledgeRetrievalNode =
    node?.data.type === BlockEnum.KnowledgeRetrieval;

  // 제목 편집 모드 시작
  const handleTitleClick = () => {
    if (node) {
      setEditedTitle(node.data.title || node.data.type);
      setIsEditingTitle(true);
    }
  };

  // 제목 저장
  const handleTitleSave = () => {
    if (editedTitle.trim() && node) {
      updateNode(selectedNodeId!, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // 제목 편집 취소
  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // Enter 키로 저장, Escape 키로 취소
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // 편집 모드 활성화 시 포커스
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // 조건부 return은 모든 Hook 이후에
  if (!selectedNodeId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        노드를 선택하세요
      </div>
    );
  }

  if (!node) return null;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId, { [field]: value });
  };

  const handleClose = () => {
    selectNode(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BlockIcon type={node.data.type} size="sm" />
          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="font-semibold text-gray-900 dark:text-white h-7 px-2 py-1"
            />
          ) : (
            <h3
              onClick={handleTitleClick}
              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              title="클릭하여 제목 수정"
            >
              {node.data.title || node.data.type}
            </h3>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
          title="닫기"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* 설명 추가 */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          value={node.data.desc || ''}
          onChange={(e) => handleUpdate('desc', e.target.value)}
          placeholder="설명 추가..."
          className="text-xs text-gray-500 dark:text-gray-400 border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
            설정
          </button>
        </div>
      </div>

      {/* 설정 내용 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* LLM 노드 전용 */}
        {isLLMNode && (
          <>
            <div>
              <Label>모델</Label>
              <LLMModelSelect
                value={(() => {
                  const model = (node.data as LLMNodeType).model;
                  return typeof model === 'object' ? model.name : model;
                })()}
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

            <div>
              <Label htmlFor="documentIds">문서 선택 (선택사항)</Label>
              <MultiSelect
                id="documentIds"
                value={
                  (node.data as KnowledgeRetrievalNodeType).documentIds || []
                }
                onChange={(selectedIds: string[]) => {
                  // 항상 새 배열로 전달 (참조 변경 보장)
                  handleUpdate('documentIds', selectedIds);
                }}
                options={documents.map((doc) => ({
                  value: doc.id,
                  label: `${doc.filename} (${(doc.size / 1024 / 1024).toFixed(2)} MB)`,
                }))}
                placeholder="검색할 문서를 선택하세요..."
                emptyMessage="문서가 없습니다. 먼저 문서를 업로드해주세요."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                선택된 문서:{' '}
                {(node.data as KnowledgeRetrievalNodeType).documentIds?.length ||
                  0}
                개
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
