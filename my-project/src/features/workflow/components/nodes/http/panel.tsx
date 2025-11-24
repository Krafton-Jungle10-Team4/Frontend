/**
 * HTTP Panel Component
 * HTTP 노드 설정 패널
 */
import { BasePanel } from '../_base/base-panel';
import { Field, Group } from '../_base/components/layout';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Button } from '@/shared/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Textarea } from '@/shared/components/textarea';

interface KeyValuePair {
  key: string;
  value: string;
}

export function HttpPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const nodeData = selectedNode?.data || {};

  const method = (nodeData as any).method || 'GET';
  const url = (nodeData as any).url || '';
  const timeout = (nodeData as any).timeout || 30;
  const body = (nodeData as any).body || '';

  const [headers, setHeaders] = useState<KeyValuePair[]>(
    (nodeData as any).headers || []
  );
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(
    (nodeData as any).query_params || []
  );

  // 노드 데이터가 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setHeaders((nodeData as any).headers || []);
    setQueryParams((nodeData as any).query_params || []);
  }, [selectedNodeId, nodeData.headers, nodeData.query_params]);

  const handleMethodChange = (value: string) => {
    updateNode(selectedNodeId!, { method: value });
  };

  const handleUrlChange = (value: string) => {
    updateNode(selectedNodeId!, { url: value });
  };

  const handleTimeoutChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateNode(selectedNodeId!, { timeout: numValue });
    }
  };

  const handleBodyChange = (value: string) => {
    updateNode(selectedNodeId!, { body: value });
  };

  const addHeader = () => {
    const newHeaders = [...headers, { key: '', value: '' }];
    setHeaders(newHeaders);
    updateNode(selectedNodeId!, { headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
    updateNode(selectedNodeId!, { headers: newHeaders });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header
    );
    setHeaders(newHeaders);
    updateNode(selectedNodeId!, { headers: newHeaders });
  };

  const addQueryParam = () => {
    const newParams = [...queryParams, { key: '', value: '' }];
    setQueryParams(newParams);
    updateNode(selectedNodeId!, { query_params: newParams });
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newParams);
    updateNode(selectedNodeId!, { query_params: newParams });
  };

  const updateQueryParam = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newParams = queryParams.map((param, i) =>
      i === index ? { ...param, [field]: value } : param
    );
    setQueryParams(newParams);
    updateNode(selectedNodeId!, { query_params: newParams });
  };

  const showBodyField = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <BasePanel title="HTTP 요청">
      <Group>
        <Field>
          <Label htmlFor="http-method">HTTP 메서드</Label>
          <Select value={method} onValueChange={handleMethodChange}>
            <SelectTrigger id="http-method">
              <SelectValue placeholder="메서드 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            요청할 HTTP 메서드를 선택하세요.
          </p>
        </Field>

        <Field>
          <Label htmlFor="http-url">URL</Label>
          <Input
            id="http-url"
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://api.example.com/endpoint"
          />
          <p className="text-xs text-gray-500 mt-1">
            요청할 URL을 입력하세요. 변수 사용 가능: {'{{'} {'{'} node.port {'}'} {'}'}
          </p>
        </Field>

        <Field>
          <div className="flex items-center justify-between mb-2">
            <Label>헤더</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeader}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              추가
            </Button>
          </div>
          {headers.length === 0 ? (
            <p className="text-xs text-gray-500">헤더가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) =>
                      updateHeader(index, 'value', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeader(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field>
          <div className="flex items-center justify-between mb-2">
            <Label>쿼리 파라미터</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQueryParam}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              추가
            </Button>
          </div>
          {queryParams.length === 0 ? (
            <p className="text-xs text-gray-500">쿼리 파라미터가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) =>
                      updateQueryParam(index, 'key', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) =>
                      updateQueryParam(index, 'value', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQueryParam(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {showBodyField && (
          <Field>
            <Label htmlFor="http-body">요청 본문 (Body)</Label>
            <Textarea
              id="http-body"
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON 형식의 요청 본문을 입력하세요.
            </p>
          </Field>
        )}

        <Field>
          <Label htmlFor="http-timeout">타임아웃 (초)</Label>
          <Input
            id="http-timeout"
            type="number"
            value={timeout}
            onChange={(e) => handleTimeoutChange(e.target.value)}
            min="1"
            max="300"
          />
          <p className="text-xs text-gray-500 mt-1">
            요청 타임아웃 시간 (1-300초)
          </p>
        </Field>
      </Group>

      <Group title="입력 포트">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="font-medium">url</span> (필수): 요청할 URL
          </div>
          <div>
            <span className="font-medium">method</span> (선택): HTTP 메서드
            (기본값: GET)
          </div>
          <div>
            <span className="font-medium">headers</span> (선택): 요청 헤더 (JSON
            객체)
          </div>
          <div>
            <span className="font-medium">query_params</span> (선택): 쿼리
            파라미터 (JSON 객체)
          </div>
          {showBodyField && (
            <div>
              <span className="font-medium">body</span> (선택): 요청 본문 (JSON
              문자열)
            </div>
          )}
          <div>
            <span className="font-medium">timeout</span> (선택): 타임아웃 초
            (기본값: 30)
          </div>
        </div>
      </Group>

      <Group title="출력 포트">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="font-medium">status_code</span>: HTTP 상태 코드
          </div>
          <div>
            <span className="font-medium">body</span>: 응답 본문
          </div>
          <div>
            <span className="font-medium">headers</span>: 응답 헤더
          </div>
          <div>
            <span className="font-medium">success</span>: 요청 성공 여부 (2xx)
          </div>
          <div>
            <span className="font-medium">error</span>: 에러 메시지 (실패 시)
          </div>
        </div>
      </Group>
    </BasePanel>
  );
}
