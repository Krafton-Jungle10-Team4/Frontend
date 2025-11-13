/**
 * Knowledge Retrieval 노드 설정 패널
 *
 * Dataset, 검색 모드, Top K, 문서 선택 설정
 */

import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { useAsyncDocumentStore } from '@/features/documents/stores/documentStore.async';
import { useCompletedDocuments } from '@/features/documents/stores/selectors';
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

// 검색 모드 타입 및 옵션
type RetrievalModeValue = 'semantic' | 'keyword' | 'hybrid';

const RETRIEVAL_MODE_OPTIONS: Array<{
  value: RetrievalModeValue;
  label: string;
}> = [
  { value: 'semantic', label: 'Semantic Search' },
  { value: 'keyword', label: 'Keyword Search' },
  { value: 'hybrid', label: 'Hybrid Search' },
];

// 검색 모드 정규화 함수
const normalizeRetrievalMode = (mode?: string): RetrievalModeValue => {
  const normalized = (mode || '').toLowerCase();
  if (normalized.startsWith('keyword')) return 'keyword';
  if (normalized.startsWith('hybrid')) return 'hybrid';
  return 'semantic';
};

// 빈 배열 상수 (참조 동일성 보장)
const EMPTY_DOCUMENT_IDS: string[] = [];

export const KnowledgeRetrievalPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const fetchDocuments = useAsyncDocumentStore((state) => state.fetchDocuments);

  // 봇 ID 결정 (URL 파라미터 또는 선택된 봇)
  const { botId: routeBotId } = useParams<{ botId: string }>();
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const activeBotId = selectedBotId || routeBotId || null;

  // 완료된 문서 목록 가져오기
  const completedDocuments = useCompletedDocuments(activeBotId);

  const node = nodes.find((n) => n.id === selectedNodeId);

  // 문서 목록 로드
  useEffect(() => {
    if (activeBotId) {
      fetchDocuments({ botId: activeBotId }).catch((error) => {
        console.error('Failed to fetch documents:', error);
      });
    }
  }, [activeBotId, fetchDocuments]);

  if (!node) return null;

  const krData = node.data as KnowledgeRetrievalNodeType;

  // 유효한 문서 ID 집합 (성능 최적화)
  const validDocumentIds = useMemo(
    () => new Set(completedDocuments.map((doc) => doc.id)),
    [completedDocuments]
  );

  // 정제된 문서 ID 목록 (유효하지 않은 ID 제거)
  const sanitizedDocumentIds = useMemo(() => {
    const ids = krData.documentIds ?? EMPTY_DOCUMENT_IDS;
    return ids.filter((id) => validDocumentIds.has(id));
  }, [krData.documentIds, validDocumentIds]);

  // 정규화된 검색 모드
  const currentRetrievalMode = normalizeRetrievalMode(krData.retrievalMode);

  // 정제된 문서 ID로 자동 업데이트 (유효하지 않은 ID 제거)
  useEffect(() => {
    if (!selectedNodeId) return;

    const original = krData.documentIds ?? EMPTY_DOCUMENT_IDS;

    // 배열이 다른 경우에만 업데이트
    if (
      original.length !== sanitizedDocumentIds.length ||
      original.some((id, idx) => id !== sanitizedDocumentIds[idx])
    ) {
      updateNode(selectedNodeId, { documentIds: sanitizedDocumentIds });
    }
  }, [krData.documentIds, sanitizedDocumentIds, selectedNodeId, updateNode]);

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
          value={currentRetrievalMode}
          onValueChange={(value) =>
            handleUpdate('retrievalMode', value as RetrievalModeValue)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RETRIEVAL_MODE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
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
          disabled={!activeBotId}
          value={sanitizedDocumentIds}
          onChange={(selectedIds: string[]) => {
            // 유효한 ID만 필터링
            const filtered = selectedIds.filter((id) =>
              validDocumentIds.has(id)
            );
            handleUpdate('documentIds', filtered);
          }}
          options={completedDocuments.map((doc) => ({
            value: doc.id,
            label: `${doc.filename} (${(doc.size / 1024 / 1024).toFixed(2)} MB) • ${doc.id}`,
          }))}
          placeholder={
            activeBotId
              ? '검색할 문서를 선택하세요...'
              : '먼저 봇을 선택해주세요.'
          }
          emptyMessage={
            !activeBotId
              ? '봇이 선택되지 않았습니다.'
              : completedDocuments.length === 0
                ? '완료된 문서가 없습니다. 먼저 문서를 업로드하거나 처리가 끝날 때까지 기다려주세요.'
                : '문서를 찾을 수 없습니다.'
          }
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          선택된 문서: {sanitizedDocumentIds.length}개
        </p>
      </div>
    </BasePanel>
  );
};
