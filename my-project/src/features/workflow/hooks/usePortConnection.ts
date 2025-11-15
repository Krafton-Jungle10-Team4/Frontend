// src/features/workflow/hooks/usePortConnection.ts

import { useCallback, useMemo } from 'react';
import type { Connection, Edge } from '@xyflow/react';
import { useWorkflowStore } from '../stores/workflowStore';
import { validatePortConnection } from '../utils/portValidation';
import type { PortDefinition, NodePortSchema } from '@shared/types/workflow';
import { PortType } from '@shared/types/workflow';

/**
 * 포트 연결 관리 훅
 * - 포트 정보 조회
 * - 엣지 연결 검증 및 생성
 * - 연결 상태 확인
 */
export function usePortConnection() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const addEdge = useWorkflowStore((state) => state.addEdge);

  /**
   * 포트 정보 조회
   */
  const getPortInfo = useCallback(
    (nodeId: string, portName: string, direction: 'input' | 'output') => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || !node.data?.ports) return null;

      const ports: NodePortSchema = node.data.ports as NodePortSchema;
      const portList = direction === 'input' ? ports.inputs : ports.outputs;
      return portList.find((p) => p.name === portName) || null;
    },
    [nodes]
  );

  /**
   * 엣지 연결 시도
   */
  const handleConnect = useCallback(
    (connection: Connection): boolean => {
      const {
        source,
        target,
        sourceHandle: sourcePort,
        targetHandle: targetPort,
      } = connection;

      if (!source || !target || !sourcePort || !targetPort) {
        return false;
      }

      // 포트 정보 조회
      const sourcePortInfo = getPortInfo(source, sourcePort, 'output');
      const targetPortInfo = getPortInfo(target, targetPort, 'input');

      if (!sourcePortInfo) {
        console.error('포트 정보를 찾을 수 없습니다.');
        return false;
      }

      let resolvedTargetPort = targetPortInfo;
      if (!resolvedTargetPort) {
        const targetNode = nodes.find((n) => n.id === target);
        const targetPorts = (targetNode?.data?.ports as NodePortSchema | undefined)
          ?.inputs;
        if (targetPorts && targetPorts.length > 0) {
          console.error('포트 정보를 찾을 수 없습니다.');
          return false;
        }
        resolvedTargetPort = {
          name: targetPort,
          type: PortType.ANY,
          required: false,
          description: 'default handle',
          display_name: targetPort,
        };
      }

      // 포트 연결 검증
      const validation = validatePortConnection(sourcePortInfo, resolvedTargetPort);

      if (!validation.valid) {
        console.error('연결 불가:', validation.error);
        // TODO: 사용자에게 에러 메시지 표시 (Toast)
        return false;
      }

      if (validation.warning) {
        console.warn('연결 경고:', validation.warning);
        // TODO: 사용자에게 경고 메시지 표시
      }

      // 엣지 생성
      const newEdge: Edge = {
        id: `edge-${source}-${sourcePort}-${target}-${targetPort}`,
        source,
        target,
        sourceHandle: sourcePort,
        targetHandle: targetPort,
        data: {
          sourcePort: sourcePortInfo,
          targetPort: resolvedTargetPort,
        },
      };

      addEdge(newEdge);
      return true;
    },
    [nodes, edges, getPortInfo, addEdge]
  );

  /**
   * 특정 포트의 연결 목록 조회
   */
  const getPortConnections = useCallback(
    (nodeId: string, portName: string, direction: 'input' | 'output') => {
      return edges.filter((edge) => {
        if (direction === 'input') {
          return edge.target === nodeId && edge.targetHandle === portName;
        } else {
          return edge.source === nodeId && edge.sourceHandle === portName;
        }
      });
    },
    [edges]
  );

  /**
   * 포트가 연결되어 있는지 확인
   */
  const isPortConnected = useCallback(
    (nodeId: string, portName: string, direction: 'input' | 'output') => {
      return getPortConnections(nodeId, portName, direction).length > 0;
    },
    [getPortConnections]
  );

  // 반환 객체를 메모이제이션하여 참조 안정성 보장
  return useMemo(
    () => ({
      handleConnect,
      getPortInfo,
      getPortConnections,
      isPortConnected,
    }),
    [handleConnect, getPortInfo, getPortConnections, isPortConnected]
  );
}
