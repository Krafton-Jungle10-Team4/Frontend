import { useState } from 'react';
import { Button } from '@shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Input } from '@shared/components/input';
import { Label } from '@shared/components/label';
import { Textarea } from '@shared/components/textarea';
import { Checkbox } from '@shared/components/checkbox';
import { useApiKeyStore } from '../stores/apiKeyStore.ts';
import { CreateAPIKeyRequest } from '../api/apiKeyClient.ts';
import { Loader2 } from 'lucide-react';

interface CreateAPIKeyDialogProps {
  botId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (plainKey: string) => void;
}

export function CreateAPIKeyDialog({
  botId,
  open,
  onClose,
  onCreated,
}: CreateAPIKeyDialogProps) {
  const { createApiKey, isLoading } = useApiKeyStore();

  const [formData, setFormData] = useState<CreateAPIKeyRequest>({
    name: '',
    description: '',
    bind_to_latest_published: true,
    permissions: { run: true, read: true, stop: true },
    rate_limits: { per_minute: 60, per_hour: 1000, per_day: 10000 },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('API 키 이름을 입력하세요.');
      return;
    }

    try {
      const plainKey = await createApiKey(botId, formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        bind_to_latest_published: true,
        permissions: { run: true, read: true, stop: true },
        rate_limits: { per_minute: 60, per_hour: 1000, per_day: 10000 },
      });
      
      // Close dialog first, then show created key dialog
      onClose();
      onCreated(plainKey);
    } catch (error) {
      console.error('API 키 생성 실패:', error);
      alert('API 키 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>새 API 키 생성</DialogTitle>
          <DialogDescription>
            워크플로우를 외부 API로 실행하기 위한 키를 발급합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Production API Key"
              required
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="프로덕션 환경용"
              rows={2}
            />
          </div>

          {/* 최신 버전 자동 바인딩 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bind_to_latest"
              checked={formData.bind_to_latest_published}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  bind_to_latest_published: checked === true,
                })
              }
            />
            <Label htmlFor="bind_to_latest" className="font-normal">
              최신 published 버전 자동 사용
            </Label>
          </div>

          {/* Rate Limits */}
          <div className="space-y-3">
            <Label>Rate Limits</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="per_minute" className="text-xs">
                  분당
                </Label>
                <Input
                  id="per_minute"
                  type="number"
                  value={formData.rate_limits.per_minute}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_limits: {
                        ...formData.rate_limits,
                        per_minute: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="per_hour" className="text-xs">
                  시간당
                </Label>
                <Input
                  id="per_hour"
                  type="number"
                  value={formData.rate_limits.per_hour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_limits: {
                        ...formData.rate_limits,
                        per_hour: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="per_day" className="text-xs">
                  일당
                </Label>
                <Input
                  id="per_day"
                  type="number"
                  value={formData.rate_limits.per_day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_limits: {
                        ...formData.rate_limits,
                        per_day: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min={1}
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label>권한</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_run"
                  checked={formData.permissions.run}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        run: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="perm_run" className="font-normal">
                  실행
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_read"
                  checked={formData.permissions.read}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        read: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="perm_read" className="font-normal">
                  조회
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm_stop"
                  checked={formData.permissions.stop}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        stop: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="perm_stop" className="font-normal">
                  중지
                </Label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '생성'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

