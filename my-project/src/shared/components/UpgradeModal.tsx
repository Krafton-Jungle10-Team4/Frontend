// @SnapShot/Frontend/my-project/src/shared/components/UpgradeModal.tsx

/**
 * @file UpgradeModal.tsx
 * @description 상위 플랜으로 업그레이드를 유도하는 공용 모달 컴포넌트입니다.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog';
import { Button } from './button';
import { ArrowRight, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Zap className="h-6 w-6 text-yellow-500 mr-2" />
            Pro 플랜으로 업그레이드
          </DialogTitle>
          <DialogDescription>
            더 강력한 기능으로 최고의 봇을 만들어보세요.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc list-inside space-y-2">
            <li>최대 10개의 봇 생성</li>
            <li>최대 5명의 팀원 초대</li>
            <li>모든 고급 워크플로우 노드 사용</li>
            <li>"Powered by SnapShot" 브랜딩 제거</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            나중에 할게요
          </Button>
          <Button onClick={onUpgrade}>
            플랜 보러가기 <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
