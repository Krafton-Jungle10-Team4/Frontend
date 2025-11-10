import { describe, expect, it } from 'vitest';

import {
  BlockEnum,
  type Edge,
  type Node,
} from '@/shared/types/workflow.types';
import { computeWorkflowAutoLayout } from '../autoLayout';

const createNode = (
  id: string,
  type: BlockEnum,
  position: { x: number; y: number }
): Node => ({
  id,
  type: 'custom',
  position,
  data: {
    type,
    title: type,
  },
});

const createEdge = (
  id: string,
  source: string,
  target: string,
  sourceType: BlockEnum,
  targetType: BlockEnum
): Edge => ({
  id,
  source,
  target,
  type: 'custom',
  data: {
    sourceType,
    targetType,
  },
});

describe('computeWorkflowAutoLayout', () => {
  it('왼쪽에서 오른쪽으로 단계가 증가하도록 배치한다', () => {
    const nodes = [
      createNode('start', BlockEnum.Start, { x: 0, y: 0 }),
      createNode('llm', BlockEnum.LLM, { x: 0, y: 0 }),
      createNode('end', BlockEnum.End, { x: 0, y: 0 }),
    ];

    const edges = [
      createEdge('e1', 'start', 'llm', BlockEnum.Start, BlockEnum.LLM),
      createEdge('e2', 'llm', 'end', BlockEnum.LLM, BlockEnum.End),
    ];

    const laidOut = computeWorkflowAutoLayout(nodes, edges);
    const byId = Object.fromEntries(laidOut.map((node) => [node.id, node]));

    expect(byId.start.position?.x ?? 0).toBeLessThan(
      byId.llm.position?.x ?? 0
    );
    expect(byId.llm.position?.x ?? 0).toBeLessThan(
      byId.end.position?.x ?? 0
    );
  });

  it('같은 단계의 노드들은 동일한 X 좌표를 공유한다', () => {
    const nodes = [
      createNode('start', BlockEnum.Start, { x: 0, y: 0 }),
      createNode('knowledge-1', BlockEnum.KnowledgeRetrieval, {
        x: 0,
        y: 100,
      }),
      createNode('knowledge-2', BlockEnum.KnowledgeRetrieval, {
        x: 0,
        y: 200,
      }),
      createNode('llm', BlockEnum.LLM, { x: 0, y: 0 }),
    ];

    const edges = [
      createEdge('e1', 'start', 'knowledge-1', BlockEnum.Start, BlockEnum.KnowledgeRetrieval),
      createEdge('e2', 'start', 'knowledge-2', BlockEnum.Start, BlockEnum.KnowledgeRetrieval),
      createEdge('e3', 'knowledge-1', 'llm', BlockEnum.KnowledgeRetrieval, BlockEnum.LLM),
      createEdge('e4', 'knowledge-2', 'llm', BlockEnum.KnowledgeRetrieval, BlockEnum.LLM),
    ];

    const laidOut = computeWorkflowAutoLayout(nodes, edges);
    const byId = Object.fromEntries(laidOut.map((node) => [node.id, node]));

    expect(byId['knowledge-1'].position?.x).toBe(
      byId['knowledge-2'].position?.x
    );
  });

  it('기존 Y 순서를 최대한 유지하며 세로 간격을 부여한다', () => {
    const nodes = [
      createNode('start', BlockEnum.Start, { x: 0, y: 0 }),
      createNode('branch-bottom', BlockEnum.LLM, { x: 0, y: 400 }),
      createNode('branch-top', BlockEnum.LLM, { x: 0, y: 100 }),
    ];
    const edges = [
      createEdge('e1', 'start', 'branch-bottom', BlockEnum.Start, BlockEnum.LLM),
      createEdge('e2', 'start', 'branch-top', BlockEnum.Start, BlockEnum.LLM),
    ];

    const laidOut = computeWorkflowAutoLayout(nodes, edges);
    const byId = Object.fromEntries(laidOut.map((node) => [node.id, node]));

    expect(
      (byId['branch-top'].position?.y ?? 0) <
        (byId['branch-bottom'].position?.y ?? 0)
    ).toBe(true);
  });
});

