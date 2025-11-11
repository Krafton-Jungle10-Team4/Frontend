/**
 * MCP 노드 설정 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { mcpApi } from '@/features/mcp/api/mcpApi';
import type { MCPProvider } from '@/features/mcp/types/mcp.types';

export const MCPNodeConfig: React.FC = () => {
  const { selectedNodeId, updateNode } = useWorkflowStore();
  const nodes = useWorkflowStore((state) => state.nodes);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // MCP 노드 데이터에 안전하게 접근하기 위한 타입 캐스팅
  const mcpData = selectedNode?.data as any;

  const [providers, setProviders] = useState<MCPProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<MCPProvider | null>(
    null
  );

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (mcpData?.provider_id && providers.length > 0) {
      const provider = providers.find(
        (p) => p.provider_id === mcpData.provider_id
      );
      setSelectedProvider(provider || null);
    }
  }, [mcpData?.provider_id, providers]);

  const loadProviders = async () => {
    try {
      const data = await mcpApi.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    if (!selectedNode) return;

    const provider = providers.find((p) => p.provider_id === providerId);
    setSelectedProvider(provider || null);

    updateNode(selectedNode.id, {
      provider_id: providerId,
      action: '',
      parameters: {},
    } as any);
  };

  const handleActionChange = (action: string) => {
    if (!selectedNode) return;
    updateNode(selectedNode.id, { action } as any);
  };

  const handleParameterChange = (key: string, value: string) => {
    if (!selectedNode) return;
    const currentParams = mcpData?.parameters || {};
    updateNode(selectedNode.id, {
      parameters: {
        ...currentParams,
        [key]: value,
      },
    } as any);
  };

  if (!selectedNode) {
    return <div className="p-4 text-sm text-gray-500">노드를 선택해주세요</div>;
  }

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="mcp-node-config p-4 space-y-4">
      <div className="config-group">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          MCP 제공자
        </label>
        <select
          value={mcpData?.provider_id || ''}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">선택하세요</option>
          {providers.map((provider) => (
            <option key={provider.provider_id} value={provider.provider_id}>
              {provider.icon} {provider.name}
            </option>
          ))}
        </select>
        {selectedProvider && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedProvider.description}
          </p>
        )}
      </div>

      {selectedProvider && (
        <>
          <div className="config-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              액션
            </label>
            <select
              value={mcpData?.action || ''}
              onChange={(e) => handleActionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">액션 선택</option>
              {selectedProvider.supported_actions.map((action) => (
                <option key={action.action_id} value={action.action_id}>
                  {action.name}
                </option>
              ))}
            </select>
          </div>

          {mcpData?.action && (
            <div className="config-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                파라미터
              </label>
              <div className="space-y-2">
                {selectedProvider.supported_actions
                  .find((a) => a.action_id === mcpData.action)
                  ?.parameters.map((param) => (
                    <div key={param.name} className="parameter-item">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {param.name}
                        {param.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={
                          (mcpData?.parameters?.[param.name] as
                            | string
                            | undefined) || ''
                        }
                        onChange={(e) =>
                          handleParameterChange(param.name, e.target.value)
                        }
                        placeholder={
                          param.description || `예: ${param.default || ''}`
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      {param.options && param.options.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          옵션: {param.options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
