/**
 * MCP 노드 설정 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { mcpApi } from '@/features/mcp/api/mcpApi';
import type { MCPProvider } from '@/features/mcp/types/mcp.types';
import { Box, Group, Field } from '@/features/workflow/components/nodes/_base/components/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Input } from '@shared/components/input';

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
    return (
      <div className="p-4 text-center text-muted-foreground">
        노드를 선택해주세요
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">로딩 중...</div>
    );
  }

  return (
    <Box>
      <Group title="MCP 제공자" description="사용할 MCP 서버를 선택하세요">
        <Field label="제공자" required>
          <Select
            value={mcpData?.provider_id || ''}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="제공자를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.provider_id} value={provider.provider_id}>
                  {provider.icon} {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvider && (
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedProvider.description}
            </p>
          )}
        </Field>
      </Group>

      {selectedProvider && (
        <Group title="액션 설정" description="실행할 액션을 선택하세요">
          <Field label="액션" required>
            <Select
              value={mcpData?.action || ''}
              onValueChange={handleActionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="액션을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {selectedProvider.supported_actions.map((action) => (
                  <SelectItem key={action.action_id} value={action.action_id}>
                    {action.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Group>
      )}

      {mcpData?.action && selectedProvider && (
        <Group title="파라미터" description="액션에 필요한 파라미터를 입력하세요">
          {selectedProvider.supported_actions
            .find((a) => a.action_id === mcpData.action)
            ?.parameters.map((param) => (
              <Field
                key={param.name}
                label={param.name}
                required={param.required}
                description={
                  param.options && param.options.length > 0
                    ? `옵션: ${param.options.join(', ')}`
                    : undefined
                }
              >
                <Input
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
                />
              </Field>
            ))}
        </Group>
      )}
    </Box>
  );
};
