/**
 * Tavily Search 노드 설정 패널
 *
 * 검색 쿼리 매핑, 검색 옵션, 도메인 필터링, 시간 필터링 설정
 */

import { useState } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Input } from '@shared/components/input';
import { Button } from '@shared/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Checkbox } from '@shared/components/checkbox';
import { Label } from '@shared/components/label';
import type { TavilySearchNodeType } from '@/shared/types/workflow.types';
import { VarReferencePicker } from '../../variable/VarReferencePicker';
import { PortType, type ValueSelector } from '@shared/types/workflow';
import { tavilyApi } from '../../../api/tavilyApi';
import { toast } from 'sonner';

export const TavilySearchPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const tavilyData = node.data as TavilySearchNodeType;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  const handleVariableChange = (
    portName: string,
    selector: ValueSelector | null
  ) => {
    const currentMappings = (node.data.variable_mappings || {}) as Record<
      string,
      {
        target_port: string;
        source: ValueSelector;
      } | undefined
    >;

    const nextMappings = { ...currentMappings };
    if (selector) {
      nextMappings[portName] = {
        target_port: portName,
        source: selector,
      };
    } else {
      delete nextMappings[portName];
    }

    updateNode(selectedNodeId!, { variable_mappings: nextMappings });
  };

  const handleTestSearch = async () => {
    if (!tavilyData.variable_mappings?.query) {
      toast.error('검색 쿼리를 먼저 매핑해주세요');
      return;
    }

    setIsTesting(true);
    try {
      const result = await tavilyApi.search({
        query: 'test query', // 실제로는 매핑된 변수 값 사용
        search_depth: tavilyData.search_depth || 'basic',
        topic: tavilyData.topic || 'general',
        max_results: tavilyData.max_results || 5,
        include_domains: tavilyData.include_domains,
        exclude_domains: tavilyData.exclude_domains,
        time_range: tavilyData.time_range || undefined,
        start_date: tavilyData.start_date || undefined,
        end_date: tavilyData.end_date || undefined,
        include_answer: tavilyData.include_answer || false,
        include_raw_content: tavilyData.include_raw_content || false,
      });
      setTestResults(result);
      toast.success(`${result.results.length}개의 검색 결과를 찾았습니다`);
    } catch (error: any) {
      toast.error(`검색 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <BasePanel>
      <Box>
        <Group
          title="입력 매핑"
          description="검색할 쿼리를 이전 노드의 출력과 연결하세요"
        >
          <Field label="검색 쿼리" required>
            <VarReferencePicker
              nodeId={node.id}
              portName="query"
              portType={PortType.STRING}
              value={node.data.variable_mappings?.query?.source || null}
              onChange={(selector) => handleVariableChange('query', selector)}
              placeholder="Start 노드의 query를 선택하세요"
            />
          </Field>
        </Group>

        <Group title="검색 옵션" description="검색 깊이와 주제를 설정하세요">
          <Field label="검색 깊이">
            <Select
              value={tavilyData.search_depth || 'basic'}
              onValueChange={(value) => handleUpdate('search_depth', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="검색 깊이 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="주제">
            <Select
              value={tavilyData.topic || 'general'}
              onValueChange={(value) => handleUpdate('topic', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="주제 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label={`최대 결과 수 (${tavilyData.max_results || 5}개)`}>
            <input
              type="range"
              min="0"
              max="20"
              value={tavilyData.max_results || 5}
              onChange={(e) =>
                handleUpdate('max_results', parseInt(e.target.value))
              }
              className="w-full"
            />
          </Field>
        </Group>

        <Group
          title="도메인 필터링"
          description="특정 도메인을 포함하거나 제외할 수 있습니다"
        >
          <Field label="포함할 도메인 (쉼표로 구분)">
            <Input
              value={(tavilyData.include_domains || []).join(', ')}
              onChange={(e) =>
                handleUpdate(
                  'include_domains',
                  e.target.value
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean)
                )
              }
              placeholder="예: techcrunch.com, reddit.com"
            />
          </Field>

          <Field label="제외할 도메인 (쉼표로 구분)">
            <Input
              value={(tavilyData.exclude_domains || []).join(', ')}
              onChange={(e) =>
                handleUpdate(
                  'exclude_domains',
                  e.target.value
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean)
                )
              }
              placeholder="예: example.com, spam.com"
            />
          </Field>
        </Group>

        <Group
          title="시간 필터링"
          description="특정 기간의 결과만 검색할 수 있습니다"
        >
          <Field label="시간 범위">
            <Select
              value={tavilyData.time_range || 'none'}
              onValueChange={(value) =>
                handleUpdate('time_range', value === 'none' ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="시간 범위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">제한 없음</SelectItem>
                <SelectItem value="day">최근 1일</SelectItem>
                <SelectItem value="week">최근 1주일</SelectItem>
                <SelectItem value="month">최근 1개월</SelectItem>
                <SelectItem value="year">최근 1년</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="시작 날짜 (YYYY-MM-DD)">
            <Input
              type="date"
              value={tavilyData.start_date || ''}
              onChange={(e) => handleUpdate('start_date', e.target.value || null)}
            />
          </Field>

          <Field label="종료 날짜 (YYYY-MM-DD)">
            <Input
              type="date"
              value={tavilyData.end_date || ''}
              onChange={(e) => handleUpdate('end_date', e.target.value || null)}
            />
          </Field>
        </Group>

        <Group title="콘텐츠 옵션" description="추가 콘텐츠를 포함할 수 있습니다">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include_answer"
              checked={tavilyData.include_answer || false}
              onCheckedChange={(checked) =>
                handleUpdate('include_answer', checked)
              }
            />
            <Label htmlFor="include_answer">AI 생성 답변 포함</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include_raw_content"
              checked={tavilyData.include_raw_content || false}
              onCheckedChange={(checked) =>
                handleUpdate('include_raw_content', checked)
              }
            />
            <Label htmlFor="include_raw_content">원본 콘텐츠 포함</Label>
          </div>
        </Group>

        <Group title="테스트" description="현재 설정으로 검색을 테스트할 수 있습니다">
          <Button
            onClick={handleTestSearch}
            disabled={isTesting || !tavilyData.variable_mappings?.query}
            className="w-full"
          >
            {isTesting ? '검색 중...' : '검색 테스트'}
          </Button>

          {testResults && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <h4 className="font-semibold mb-2">테스트 결과</h4>
              <p className="text-sm">
                {testResults.results.length}개의 결과를 {testResults.response_time.toFixed(2)}초 만에 찾았습니다
              </p>
              {testResults.results.length > 0 && (
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {testResults.results.slice(0, 3).map((result: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-white dark:bg-gray-700 rounded text-xs"
                    >
                      <div className="font-semibold">{result.title}</div>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">
                        {result.url}
                      </div>
                    </div>
                  ))}
                  {testResults.results.length > 3 && (
                    <p className="text-xs text-gray-500">
                      외 {testResults.results.length - 3}개
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Group>
      </Box>
    </BasePanel>
  );
};
