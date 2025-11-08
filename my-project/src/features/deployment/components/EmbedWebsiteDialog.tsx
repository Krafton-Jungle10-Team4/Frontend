/**
 * EmbedWebsiteDialog
 * 웹사이트 임베드 다이얼로그
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

interface EmbedWebsiteDialogProps {
  botId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedWebsiteDialog: FC<EmbedWebsiteDialogProps> = ({
  botId,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>웹사이트에 임베드하기</DialogTitle>
          <DialogDescription>
            다음 코드를 웹사이트의 &lt;body&gt; 태그 내에 붙여넣으세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              임베드 코드가 여기에 표시됩니다. (Phase 3에서 구현 예정)
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
