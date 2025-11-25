/**
 * MarketplacePublisher
 * Phase 6: 기능 통합 및 연동 - 마켓플레이스 게시 컴포넌트
 */

import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Textarea } from '@/shared/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { toast } from 'sonner';
import type { PublishConfig } from '@/shared/types/workflow';
import { publishToMarketplace } from '../api/marketplaceApi';
import { TagInput } from './TagInput';

interface MarketplacePublisherProps {
  workflowId: string;
}

export function MarketplacePublisher({ workflowId }: MarketplacePublisherProps) {
  const [publishConfig, setPublishConfig] = useState<PublishConfig>({
    workflow_version_id: '',
    display_name: '',
    description: '',
    category: '',
    tags: [],
    thumbnail_url: '',
    screenshots: [],
    readme: '',
    use_cases: []
  });

  const [pricing, setPricing] = useState<'free' | 'paid'>('free');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!publishConfig.workflow_version_id) {
      toast.error('서비스 버전 ID를 입력해주세요');
      return;
    }

    if (!publishConfig.display_name) {
      toast.error('마켓플레이스 이름을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await publishToMarketplace(publishConfig);
      toast.success('마켓플레이스에 게시되었습니다', {
        description: '서비스가 성공적으로 게시되었습니다.',
        className: 'toast-success-green',
        style: {
          border: '1px solid #10B981',
          backgroundColor: '#F7FEF9',
        },
      });
    } catch (error: any) {
      toast.error('게시 실패: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>서비스 버전 ID *</Label>
        <Input
          value={publishConfig.workflow_version_id}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            workflow_version_id: e.target.value
          })}
          placeholder="게시할 서비스 버전 ID"
        />
        <p className="text-xs text-muted-foreground mt-1">
          서비스 버전 히스토리에서 확인 가능합니다
        </p>
      </div>

      <div>
        <Label>마켓플레이스 이름 *</Label>
        <Input
          value={publishConfig.display_name}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            display_name: e.target.value
          })}
          placeholder="서비스 이름"
          maxLength={100}
        />
      </div>

      <div>
        <Label>설명</Label>
        <Textarea
          value={publishConfig.description}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            description: e.target.value
          })}
          rows={4}
          placeholder="이 서비스가 무엇을 하는지 설명해주세요"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {publishConfig.description?.length || 0} / 500 자
        </p>
      </div>

      <div>
        <Label>카테고리</Label>
        <Select
          value={publishConfig.category}
          onValueChange={(value) => setPublishConfig({
            ...publishConfig,
            category: value
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="automation">자동화</SelectItem>
            <SelectItem value="analytics">분석</SelectItem>
            <SelectItem value="chatbot">서비스</SelectItem>
            <SelectItem value="integration">통합</SelectItem>
            <SelectItem value="customer-support">고객 지원</SelectItem>
            <SelectItem value="data-processing">데이터 처리</SelectItem>
            <SelectItem value="ai-assistant">AI 어시스턴트</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>태그</Label>
        <TagInput
          value={publishConfig.tags || []}
          onChange={(tags) => setPublishConfig({ ...publishConfig, tags })}
        />
      </div>

      <div>
        <Label>가격 정책</Label>
        <RadioGroup
          value={pricing}
          onValueChange={(value: 'free' | 'paid') => setPricing(value)}
          className="flex items-center gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free" className="cursor-pointer">무료</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid" className="cursor-pointer">유료</Label>
          </div>
        </RadioGroup>
        {pricing === 'paid' && (
          <p className="text-xs text-muted-foreground mt-2">
            유료 버전은 추후 지원 예정입니다
          </p>
        )}
      </div>

      <div>
        <Label>썸네일 URL</Label>
        <Input
          value={publishConfig.thumbnail_url}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            thumbnail_url: e.target.value
          })}
          placeholder="https://example.com/thumbnail.png"
          type="url"
        />
      </div>

      <div>
        <Label>스크린샷 URL (쉼표로 구분)</Label>
        <Textarea
          value={publishConfig.screenshots?.join(', ') || ''}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            screenshots: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          rows={3}
          placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png"
        />
      </div>

      <div>
        <Label>README (Markdown)</Label>
        <Textarea
          value={publishConfig.readme}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            readme: e.target.value
          })}
          rows={6}
          placeholder="# 사용 가이드&#10;&#10;## 설치 방법&#10;..."
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label>사용 사례 (쉼표로 구분)</Label>
        <Textarea
          value={publishConfig.use_cases?.join(', ') || ''}
          onChange={(e) => setPublishConfig({
            ...publishConfig,
            use_cases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          rows={3}
          placeholder="고객 문의 자동 응답, 24/7 지원, FAQ 처리"
        />
      </div>

      <Button
        onClick={handlePublish}
        className="w-full"
        disabled={loading || !publishConfig.workflow_version_id || !publishConfig.display_name}
      >
        {loading ? '게시 중...' : '마켓플레이스에 게시'}
      </Button>
    </div>
  );
}
