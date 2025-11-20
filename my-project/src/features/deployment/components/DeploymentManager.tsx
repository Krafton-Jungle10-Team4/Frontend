/**
 * DeploymentManager
 * Phase 6: 기능 통합 및 연동 - 배포 관리 컴포넌트
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select';
import { Slider } from '@/shared/components/slider';
import { toast } from 'sonner';
import type { DeployConfig } from '@/shared/types/workflow';
import { deploymentApi } from '../api/deploymentApi';
import { EnvVarsEditor } from './EnvVarsEditor';

interface DeploymentManagerProps {
  workflowId: string;
}

export function DeploymentManager({ workflowId }: DeploymentManagerProps) {
  const [config, setConfig] = useState<DeployConfig>({
    workflow_version_id: '',
    status: 'published',
    allowed_domains: [],
    widget_config: {
      theme: 'light',
      position: 'bottom-right',
      auto_open: false,
      auto_open_delay: 0,
      welcome_message: '',
      placeholder_text: '',
      primary_color: '#5E3AEE',
      bot_name: '',
      avatar_url: null,
      show_typing_indicator: true,
      enable_file_upload: false,
      max_file_size_mb: 10,
      allowed_file_types: [],
      enable_feedback: true,
      enable_sound: true,
      save_conversation: true,
      conversation_storage: 'localStorage',
      custom_css: '',
      custom_js: ''
    }
  });

  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [scalingConfig, setScalingConfig] = useState({
    min: 1,
    max: 10,
    targetCPU: 70
  });
  const [loading, setLoading] = useState(false);

  const loadDeployment = useCallback(async () => {
    try {
      const deployment = await deploymentApi.get(workflowId);
      if (deployment) {
        setConfig(prevConfig => ({
          ...prevConfig,
          status: deployment.status,
          allowed_domains: deployment.allowed_domains || [],
          widget_config: {
            ...prevConfig.widget_config,
            ...deployment.widget_config
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load deployment:', error);
    }
  }, [workflowId]);

  useEffect(() => {
    loadDeployment();
  }, [loadDeployment]);

  const handleDeploy = async () => {
    if (!config.workflow_version_id) {
      toast.error('워크플로우 버전을 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      await deploymentApi.createOrUpdate(workflowId, config);
      toast.success('배포가 시작되었습니다');
    } catch (error: any) {
      toast.error('배포 실패: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>배포 환경</Label>
        <Select
          value={config.status || 'published'}
          onValueChange={(value: 'draft' | 'published' | 'suspended') =>
            setConfig({ ...config, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">개발 (Draft)</SelectItem>
            <SelectItem value="published">프로덕션 (Published)</SelectItem>
            <SelectItem value="suspended">일시 중단 (Suspended)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>워크플로우 버전 ID</Label>
        <Input
          value={config.workflow_version_id}
          onChange={(e) => setConfig({ ...config, workflow_version_id: e.target.value })}
          placeholder="배포할 워크플로우 버전 ID"
        />
        <p className="text-xs text-muted-foreground mt-1">
          워크플로우 버전 히스토리에서 확인 가능합니다
        </p>
      </div>

      <div>
        <Label>허용 도메인</Label>
        <Input
          value={config.allowed_domains?.join(', ') || ''}
          onChange={(e) => setConfig({
            ...config,
            allowed_domains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
          })}
          placeholder="예: example.com, sub.example.com"
        />
        <p className="text-xs text-muted-foreground mt-1">
          쉼표로 구분하여 여러 도메인 입력 가능
        </p>
      </div>

      <div>
        <Label>환경 변수</Label>
        <EnvVarsEditor
          value={envVars}
          onChange={setEnvVars}
        />
      </div>

      <div>
        <Label>스케일링 설정</Label>
        <div className="space-y-4 mt-2 p-4 border border-gray-200 rounded-md">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">최소 인스턴스</span>
              <span className="text-sm font-medium">{scalingConfig.min}</span>
            </div>
            <Slider
              value={[scalingConfig.min]}
              onValueChange={([value]) =>
                setScalingConfig({ ...scalingConfig, min: value })
              }
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">최대 인스턴스</span>
              <span className="text-sm font-medium">{scalingConfig.max}</span>
            </div>
            <Slider
              value={[scalingConfig.max]}
              onValueChange={([value]) =>
                setScalingConfig({ ...scalingConfig, max: value })
              }
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">CPU 타겟 (%)</span>
              <span className="text-sm font-medium">{scalingConfig.targetCPU}%</span>
            </div>
            <Slider
              value={[scalingConfig.targetCPU]}
              onValueChange={([value]) =>
                setScalingConfig({ ...scalingConfig, targetCPU: value })
              }
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleDeploy}
        className="w-full"
        disabled={loading}
      >
        {loading ? '배포 중...' : '배포 시작'}
      </Button>
    </div>
  );
}
