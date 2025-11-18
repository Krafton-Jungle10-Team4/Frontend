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
import { Box, Group, Field, InputMappingSection } from '../_base/components';
import { Input } from '@shared/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { MultiSelect } from '@shared/components/multi-select';
import type { KnowledgeRetrievalNodeType } from '@/shared/types/workflow.types';
type WorkflowNode = ReturnType<typeof useWorkflowStore>['nodes'][number];

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

  // 문서 목록 로드
  useEffect(() => {
    if (activeBotId) {
      fetchDocuments({ botId: activeBotId }).catch((error) => {
        console.error('Failed to fetch documents:', error);
      });
    }
  }, [activeBotId, fetchDocuments]);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNodeId || !node) {
    return null;
  }

  return (
    <KnowledgeRetrievalPanelContent
      key={selectedNodeId}
      nodeId={selectedNodeId}
      node={node}
      updateNode={updateNode}
      completedDocuments={completedDocuments}
      activeBotId={activeBotId}
    />
  );
};

interface KnowledgeRetrievalPanelContentProps {
  nodeId: string;
  node: WorkflowNode;
  updateNode: ReturnType<typeof useWorkflowStore>['updateNode'];
  completedDocuments: ReturnType<typeof useCompletedDocuments>;
  activeBotId: string | null;
}

function KnowledgeRetrievalPanelContent({
  nodeId,
  node,
  updateNode,
  completedDocuments,
  activeBotId,
}: KnowledgeRetrievalPanelContentProps) {
  const krData = node.data as KnowledgeRetrievalNodeType;

  const validDocumentIds = useMemo(
    () => new Set(completedDocuments.map((doc) => doc.id)),
    [completedDocuments]
  );

  const sanitizedDocumentIds = useMemo(() => {
    const ids = krData.documentIds ?? EMPTY_DOCUMENT_IDS;
    return ids.filter((id) => validDocumentIds.has(id));
  }, [krData.documentIds, validDocumentIds]);

  const currentRetrievalMode = normalizeRetrievalMode(krData.retrievalMode);

  useEffect(() => {
    const original = krData.documentIds ?? EMPTY_DOCUMENT_IDS;

    if (
      original.length !== sanitizedDocumentIds.length ||
      original.some((id, idx) => id !== sanitizedDocumentIds[idx])
    ) {
      updateNode(nodeId, { documentIds: sanitizedDocumentIds });
    }
  }, [krData.documentIds, sanitizedDocumentIds, nodeId, updateNode]);

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(nodeId, { [field]: value });
  };

  return (
    <BasePanel>
      <Box>
        <InputMappingSection
          nodeId={node.id}
          ports={node.data.ports}
          title="입력 매핑"
          description="검색할 쿼리를 이전 노드의 출력과 연결하세요"
        />

        <Group title="데이터 소스">
          <Field label="데이터셋">
            <Input
              value={krData.dataset || ''}
              onChange={(e) => handleUpdate('dataset', e.target.value)}
              placeholder="데이터셋 ID를 입력하세요..."
            />
          </Field>
        </Group>

        <Group title="검색 설정">
          <Field label="검색 모드" description="문서 검색 방식을 선택하세요">
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
          </Field>

          <Field label="Top K" description="">
            <Input
              type="number"
              min="1"
              max="20"
              value={krData.topK || 5}
              onChange={(e) =>
                handleUpdate('topK', parseInt(e.target.value, 10))
              }
            />
          </Field>
        </Group>

        <Group
          title="문서 필터"
          description="특정 문서만 검색하려면 선택하세요"
        >
          <Field label="문서 선택 (선택사항)">
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
          </Field>
        </Group>
      </Box>
    </BasePanel>
  );
};
