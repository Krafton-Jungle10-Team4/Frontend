/**
 * ApiReferenceDialog
 * API 참조 다이얼로그
 *
 * 추후 상세 구현 예정
 * 현재는 기본 구조
 */

import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';

interface ApiReferenceDialogProps {
  botId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ApiReferenceDialog: FC<ApiReferenceDialogProps> = ({
  botId,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>API 참조</DialogTitle>
          <DialogDescription>
            챗봇 API 사용 방법 및 엔드포인트 정보
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              API 참조 문서가 여기에 표시됩니다. (Phase 4에서 구현 예정)
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Bot ID: {botId}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
