import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkflowStore } from '../workflowStore';
import type { Edge, Node } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import { PortType } from '@shared/types/workflow';

describe('workflowStore edge behavior', () => {
  beforeEach(() => {
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      hasUnsavedChanges: false,
    });
  });

  it('keeps only a single edge per source-target pair', () => {
    const { addEdge } = useWorkflowStore.getState();
    const baseEdge: Edge = {
      id: 'temporary',
      source: 'node-a',
      target: 'node-b',
      type: 'custom',
      data: {
        sourceType: BlockEnum.Start,
        targetType: BlockEnum.LLM,
      },
    };

    addEdge(baseEdge);
    addEdge({
      ...baseEdge,
      id: 'another-temp-id',
    });

    const { edges } = useWorkflowStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('edge-node-a-node-b');
  });

  it('removes variable mappings originating from a deleted edge source', () => {
    const nodes: Node[] = [
      {
        id: 'node-a',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          type: BlockEnum.Start,
          title: 'Start',
          desc: '',
          ports: {
            inputs: [],
            outputs: [
              {
                name: 'output',
                type: PortType.STRING,
                required: true,
                default_value: null,
                description: '',
                display_name: '출력',
              },
            ],
          },
          variable_mappings: {},
        },
      },
      {
        id: 'node-b',
        type: 'custom',
        position: { x: 200, y: 0 },
        data: {
          type: BlockEnum.LLM,
          title: 'LLM',
          desc: '',
          ports: {
            inputs: [
              {
                name: 'query',
                type: PortType.STRING,
                required: true,
                default_value: null,
                description: '',
                display_name: '질문',
              },
              {
                name: 'context',
                type: PortType.STRING,
                required: false,
                default_value: null,
                description: '',
                display_name: '컨텍스트',
              },
            ],
            outputs: [],
          },
          variable_mappings: {
            query: {
              target_port: 'query',
              source: {
                variable: 'node-a.output',
                value_type: PortType.STRING,
              },
            },
            context: {
              target_port: 'context',
              source: {
                variable: 'env.context',
                value_type: PortType.STRING,
              },
            },
          },
        },
      },
    ];
    const edges: Edge[] = [
      {
        id: 'edge-node-a-node-b',
        source: 'node-a',
        target: 'node-b',
        type: 'custom',
        data: {
          sourceType: BlockEnum.Start,
          targetType: BlockEnum.LLM,
        },
      },
    ];

    useWorkflowStore.setState({
      nodes,
      edges,
    });

    const { deleteEdge } = useWorkflowStore.getState();
    deleteEdge('edge-node-a-node-b');

    const updatedTarget = useWorkflowStore
      .getState()
      .nodes.find((node) => node.id === 'node-b');

    expect(updatedTarget?.data.variable_mappings?.query).toBeUndefined();
    expect(updatedTarget?.data.variable_mappings?.context).toBeDefined();
  });
});
