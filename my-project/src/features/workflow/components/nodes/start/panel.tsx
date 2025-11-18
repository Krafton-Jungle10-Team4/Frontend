/**
 * Start 노드 설정 패널
 *
 * 워크플로우 메타데이터 설정 (제목, 설명)
 * Phase 2: 워크플로우 입력 변수 정의 UI 추가
 */

import { useMemo } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import { Button } from '@shared/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Switch } from '@shared/components/switch';
import { BlockEnum, type StartNodeType, type StartPortBinding } from '@shared/types/workflow.types';
import { PortType, type PortDefinition, type NodePortSchema } from '@shared/types/workflow/port.types';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { Plus, Trash2 } from 'lucide-react';

export const StartPanel = () => {
  const { selectedNodeId, nodes } = useWorkflowStore();
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setEdges = useWorkflowStore((state) => state.setEdges);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const startData = node.data as StartNodeType;
  const portSchema: NodePortSchema = useMemo(() => {
    if (startData.ports) {
      return startData.ports;
    }
    return {
      inputs: [],
      outputs: [
        {
          name: 'query',
          display_name: '사용자 질문',
          description: '사용자 메시지',
          type: PortType.STRING,
          required: true,
        },
        {
          name: 'session_id',
          display_name: '세션 ID',
          description: '세션 식별자',
          type: PortType.STRING,
          required: false,
        },
      ],
    };
  }, [startData.ports]);

  const outputs = portSchema.outputs || [];
  const portBindings = startData.port_bindings || {};

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  const updatePorts = (nextOutputs: PortDefinition[], updatedBindings?: Record<string, StartPortBinding>) => {
    const normalized = nextOutputs.map((port) => ({
      ...port,
      display_name: port.display_name || port.name,
      description: port.description || '',
    }));

    let bindings = updatedBindings ?? portBindings;
    const validNames = new Set(normalized.map((port) => port.name));
    bindings = Object.fromEntries(
      Object.entries(bindings).filter(([name]) => validNames.has(name))
    );

    updateNode(selectedNodeId!, {
      ports: {
        inputs: portSchema.inputs || [],
        outputs: normalized,
      },
      port_bindings: bindings,
    });
  };

  const handlePortFieldChange = (
    index: number,
    field: keyof PortDefinition,
    value: string | boolean
  ) => {
    const nextOutputs = outputs.map((port, portIndex) =>
      portIndex === index
        ? {
            ...port,
            [field]: value,
            ...(field === 'display_name' && !value
              ? { display_name: port.name }
              : {}),
          }
        : port
    );
    updatePorts(nextOutputs);
  };

  const handleRenamePort = (index: number, nextName: string) => {
    const oldName = outputs[index]?.name;
    if (!oldName) return;

    const sanitized = nextName.trim() || oldName;
    const nextOutputs = outputs.map((port, portIndex) =>
      portIndex === index
        ? {
            ...port,
            name: sanitized,
            display_name:
              port.display_name === oldName || !port.display_name
                ? sanitized
                : port.display_name,
          }
        : port
    );

    const nextBindings = { ...portBindings };
    if (nextBindings[oldName]) {
      nextBindings[sanitized] = nextBindings[oldName];
      delete nextBindings[oldName];
    } else if (oldName === 'query') {
      nextBindings[sanitized] = { type: 'user_message' };
    } else if (oldName === 'session_id') {
      nextBindings[sanitized] = { type: 'session_id' };
    }

    updatePorts(nextOutputs, nextBindings);

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.source === node.id && edge.sourceHandle === oldName) {
          return {
            ...edge,
            sourceHandle: sanitized,
          };
        }
        return edge;
      })
    );
  };

  const handleAddPort = () => {
    const baseName = `output_${outputs.length + 1}`;
    const existingNames = new Set(outputs.map((port) => port.name));
    let candidate = baseName;
    let attempt = 1;
    while (existingNames.has(candidate)) {
      candidate = `${baseName}_${attempt++}`;
    }

    const nextBindings = {
      ...portBindings,
      [candidate]: { type: 'literal', value: '' },
    };

    const nextOutputs = [
      ...outputs,
      {
        name: candidate,
        display_name: candidate,
        description: '',
        type: PortType.ANY,
        required: false,
      },
    ];
    updatePorts(nextOutputs, nextBindings);
  };

  const handleRemovePort = (index: number) => {
    const targetPort = outputs[index];
    if (!targetPort) return;

    const nextOutputs = outputs.filter((_, i) => i !== index);
    const nextBindings = { ...portBindings };
    delete nextBindings[targetPort.name];
    updatePorts(nextOutputs, nextBindings);
  };

  const handleBindingChange = (portName: string, nextBinding: StartPortBinding) => {
    const nextBindings = {
      ...portBindings,
      [portName]: nextBinding,
    };
    updateNode(selectedNodeId!, { port_bindings: nextBindings });
  };

  const bindingForPort = (portName: string): StartPortBinding => {
    if (portBindings[portName]) {
      return portBindings[portName];
    }
    if (portName === 'query') {
      return { type: 'user_message' };
    }
    if (portName === 'session_id') {
      return { type: 'session_id' };
    }
    return { type: 'literal', value: '' };
  };

  const bindingOptions = [
    { value: 'user_message', label: '사용자 입력 (sys.user_message)' },
    { value: 'session_id', label: '세션 ID (sys.session_id)' },
    { value: 'literal', label: '직접 값 입력' },
  ] as const;

  return (
    <BasePanel>
      <Box>
        <Group title="기본 설정" description="워크플로우 시작점 정보를 설정하세요">
          <Field label="제목" required>
            <Input
              value={startData.title || ''}
              onChange={(e) => handleUpdate('title', e.target.value)}
              placeholder="워크플로우 시작"
            />
          </Field>

          <Field label="설명">
            <Textarea
              value={startData.desc || ''}
              onChange={(e) => handleUpdate('desc', e.target.value)}
              rows={3}
              placeholder="이 워크플로우에 대한 설명을 입력하세요..."
            />
          </Field>
        </Group>

        <Group
          title="출력 포트"
          description="템플릿과 연결할 출력 포트를 정의하세요"
        >
          <div className="flex flex-col gap-4">
            {outputs.map((port, index) => {
              const binding = bindingForPort(port.name);
              return (
                <div
                  key={`${port.name}-${index}`}
                  className="rounded-xl border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between pb-3">
                    <p className="text-sm font-semibold">포트 #{index + 1}</p>
                    {outputs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePort(index)}
                      >
                        <Trash2 className="size-4" />
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="포트 이름" required>
                      <Input
                        value={port.name}
                        onChange={(e) => handleRenamePort(index, e.target.value)}
                        placeholder="포트 이름"
                      />
                    </Field>

                    <Field label="표시 이름">
                      <Input
                        value={port.display_name || ''}
                        onChange={(e) =>
                          handlePortFieldChange(index, 'display_name', e.target.value)
                        }
                        placeholder="UI에 표시할 이름"
                      />
                    </Field>

                    <Field label="데이터 타입" required>
                      <Select
                        value={port.type}
                        onValueChange={(value) =>
                          handlePortFieldChange(index, 'type', value as PortType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="타입 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PORT_TYPE_META).map(([type, meta]) => (
                            <SelectItem key={type} value={type}>
                              {meta.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="필수 여부">
                      <div className="flex h-9 items-center gap-2">
                        <Switch
                          checked={port.required}
                          onCheckedChange={(checked) =>
                            handlePortFieldChange(index, 'required', checked)
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          필수 입력으로 표시
                        </span>
                      </div>
                    </Field>

                    <Field label="데이터 소스" className="sm:col-span-2">
                      <Select
                        value={binding.type}
                        onValueChange={(value) =>
                          handleBindingChange(
                            port.name,
                            value === 'literal'
                              ? {
                                  type: 'literal',
                                  value:
                                    binding.type === 'literal' ? binding.value : '',
                                }
                              : { type: value as StartPortBinding['type'] }
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="소스를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {bindingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    {binding.type === 'literal' && (
                      <Field label="기본 값" className="sm:col-span-2">
                        <Input
                          value={binding.value ?? ''}
                          onChange={(e) =>
                            handleBindingChange(port.name, {
                              type: 'literal',
                              value: e.target.value,
                            })
                          }
                          placeholder="출력 기본 값을 입력하세요"
                        />
                      </Field>
                    )}
                  </div>

                  <Field label="설명" className="pt-2">
                    <Textarea
                      value={port.description || ''}
                      onChange={(e) =>
                        handlePortFieldChange(index, 'description', e.target.value)
                      }
                      rows={2}
                      placeholder="이 출력이 무엇을 의미하는지 설명하세요"
                    />
                  </Field>
                </div>
              );
            })}

            <Button type="button" variant="secondary" onClick={handleAddPort}>
              <Plus className="size-4" /> 포트 추가
            </Button>
          </div>
        </Group>
      </Box>
    </BasePanel>
  );
};
