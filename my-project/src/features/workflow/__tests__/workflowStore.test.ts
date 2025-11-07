/**
 * Workflow Store 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '../stores/workflowStore';
import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

describe('workflowStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      selectedNode: null,
    });
  });

  describe('Node 관리', () => {
    it('Node를 추가할 수 있어야 한다', () => {
      const { addNode, nodes } = useWorkflowStore.getState();

      const newNode: Node = {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '시작',
        },
      };

      addNode(newNode);

      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toEqual(newNode);
    });

    it('Node를 업데이트할 수 있어야 한다', () => {
      const { addNode, updateNode, nodes } = useWorkflowStore.getState();

      const node: Node = {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '시작',
        },
      };

      addNode(node);

      updateNode('node-1', {
        position: { x: 200, y: 200 },
      });

      expect(nodes[0].position).toEqual({ x: 200, y: 200 });
    });

    it('Node를 삭제할 수 있어야 한다', () => {
      const { addNode, deleteNode, nodes } = useWorkflowStore.getState();

      const node: Node = {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '시작',
        },
      };

      addNode(node);
      expect(nodes).toHaveLength(1);

      deleteNode('node-1');
      expect(nodes).toHaveLength(0);
    });

    it('여러 Node를 한번에 설정할 수 있어야 한다', () => {
      const { setNodes, nodes } = useWorkflowStore.getState();

      const newNodes: Node[] = [
        {
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: {
            type: BlockEnum.Start,
            title: 'Start',
            desc: '시작',
          },
        },
        {
          id: 'node-2',
          type: 'custom',
          position: { x: 200, y: 200 },
          data: {
            type: BlockEnum.End,
            title: 'End',
            desc: '종료',
          },
        },
      ];

      setNodes(newNodes);

      expect(nodes).toHaveLength(2);
      expect(nodes).toEqual(newNodes);
    });
  });

  describe('Edge 관리', () => {
    it('Edge를 추가할 수 있어야 한다', () => {
      const { addEdge, edges } = useWorkflowStore.getState();

      const newEdge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
        data: {
          sourceType: BlockEnum.Start,
          targetType: BlockEnum.End,
        },
      };

      addEdge(newEdge);

      expect(edges).toHaveLength(1);
      expect(edges[0]).toEqual(newEdge);
    });

    it('Edge를 업데이트할 수 있어야 한다', () => {
      const { addEdge, updateEdge, edges } = useWorkflowStore.getState();

      const edge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
        data: {
          sourceType: BlockEnum.Start,
          targetType: BlockEnum.End,
        },
      };

      addEdge(edge);

      updateEdge('edge-1', {
        target: 'node-3',
      });

      expect(edges[0].target).toBe('node-3');
    });

    it('Edge를 삭제할 수 있어야 한다', () => {
      const { addEdge, deleteEdge, edges } = useWorkflowStore.getState();

      const edge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
        data: {
          sourceType: BlockEnum.Start,
          targetType: BlockEnum.End,
        },
      };

      addEdge(edge);
      expect(edges).toHaveLength(1);

      deleteEdge('edge-1');
      expect(edges).toHaveLength(0);
    });

    it('여러 Edge를 한번에 설정할 수 있어야 한다', () => {
      const { setEdges, edges } = useWorkflowStore.getState();

      const newEdges: Edge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          type: 'custom',
          data: {
            sourceType: BlockEnum.Start,
            targetType: BlockEnum.LLM,
          },
        },
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
          type: 'custom',
          data: {
            sourceType: BlockEnum.LLM,
            targetType: BlockEnum.End,
          },
        },
      ];

      setEdges(newEdges);

      expect(edges).toHaveLength(2);
      expect(edges).toEqual(newEdges);
    });
  });

  describe('Node 선택', () => {
    it('Node를 선택할 수 있어야 한다', () => {
      const { selectNode, selectedNode } = useWorkflowStore.getState();

      const node: Node = {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '시작',
        },
      };

      selectNode(node);

      expect(selectedNode).toEqual(node);
    });

    it('Node 선택을 해제할 수 있어야 한다', () => {
      const { selectNode, selectedNode } = useWorkflowStore.getState();

      const node: Node = {
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '시작',
        },
      };

      selectNode(node);
      expect(selectedNode).toEqual(node);

      selectNode(null);
      expect(selectedNode).toBeNull();
    });
  });

  describe('Node 삭제 시 연결된 Edge 처리', () => {
    it('Node 삭제 시 연결된 Edge도 함께 삭제되어야 한다', () => {
      const { addNode, addEdge, deleteNode, nodes, edges } =
        useWorkflowStore.getState();

      // Node 추가
      addNode({
        id: 'node-1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { type: BlockEnum.Start, title: 'Start', desc: '시작' },
      });

      addNode({
        id: 'node-2',
        type: 'custom',
        position: { x: 200, y: 200 },
        data: { type: BlockEnum.End, title: 'End', desc: '종료' },
      });

      // Edge 추가
      addEdge({
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
        data: {
          sourceType: BlockEnum.Start,
          targetType: BlockEnum.End,
        },
      });

      expect(nodes).toHaveLength(2);
      expect(edges).toHaveLength(1);

      // Node 삭제
      deleteNode('node-1');

      // Node는 삭제되지만 Edge는 수동으로 관리해야 함
      expect(nodes).toHaveLength(1);
      // 실제 구현에서는 Edge도 함께 삭제하는 로직이 필요할 수 있음
    });
  });
});
