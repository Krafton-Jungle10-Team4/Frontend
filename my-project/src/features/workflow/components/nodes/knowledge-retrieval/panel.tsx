/**
 * Knowledge Retrieval 노드 설정 패널
 *
 * Dataset, 검색 모드, Top K, 문서 선택 설정
 */

import { useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useAsyncDocumentStore } from '@/features/documents/stores/documentStore.async';
import { useBotStore } from '@/features/bot/stores/botStore';
import { BasePanel } from '../_base/base-panel';
import { Input } from '@shared/components/input';
import { Label } from '@shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { MultiSelect } from '@shared/components/multi-select';
import type { KnowledgeRetrievalNodeType } from '@/shared/types/workflow.types';

export const KnowledgeRetrievalPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const { documents, fetchDocuments } = useAsyncDocumentStore();
  const { selectedBotId } = useBotStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  // 문서 목록 로드
  useEffect(() => {
    if (selectedBotId) {
      fetchDocuments({ botId: selectedBotId }).catch((error) => {
        console.error('Failed to fetch documents:', error);
      });
    }
  }, [selectedBotId, fetchDocuments]);

  if (!node) return null;

  const krData = node.data as KnowledgeRetrievalNodeType;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      {/* 데이터셋 */}
      <div className="space-y-2">
        <Label className="font-semibold">데이터셋</Label>
        <Input
          value={krData.dataset || ''}
          onChange={(e) => handleUpdate('dataset', e.target.value)}
          placeholder="데이터셋 ID를 입력하세요..."
        />
      </div>

      {/* 검색 모드 */}
      <div className="space-y-2">
        <Label className="font-semibold">검색 모드</Label>
        <Select
          value={krData.retrievalMode}
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

      {/* Top K */}
      <div className="space-y-2">
        <Label className="font-semibold">Top K</Label>
        <Input
          type="number"
          min="1"
          max="20"
          value={krData.topK || 5}
          onChange={(e) =>
            handleUpdate('topK', parseInt(e.target.value, 10))
          }
        />
      </div>

      {/* 문서 선택 */}
      <div className="space-y-2">
        <Label htmlFor="documentIds" className="font-semibold">
          문서 선택 (선택사항)
        </Label>
        <MultiSelect
          id="documentIds"
          value={krData.documentIds || []}
          onChange={(selectedIds: string[]) => {
            handleUpdate('documentIds', selectedIds);
          }}
          options={Array.from(documents.values())
            .filter((doc) => doc.status === 'done')
            .map((doc) => ({
              value: doc.documentId,
              label: `${doc.originalFilename} (${(doc.fileSize / 1024 / 1024).toFixed(2)} MB)`,
            }))}
          placeholder="검색할 문서를 선택하세요..."
          emptyMessage="문서가 없습니다. 먼저 문서를 업로드해주세요."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          선택된 문서: {krData.documentIds?.length || 0}개
        </p>
      </div>
    </BasePanel>
  );
};
