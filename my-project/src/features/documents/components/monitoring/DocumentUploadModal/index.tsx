import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { FileDropzone } from './FileDropzone';
import { UploadProgress } from './UploadProgress';
import { useAsyncDocumentStore } from '../../../stores/documentStore.async';
import { useBotStore } from '@/features/bot/stores/botStore';
import { toast } from 'sonner';

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { uploadDocumentAsync } = useAsyncDocumentStore();
  const selectedBotId = useBotStore((state) => state.selectedBotId);

  const handleUpload = async () => {
    if (!selectedBotId) {
      toast.error('봇을 선택해주세요');
      return;
    }

    if (files.length === 0) {
      toast.error('파일을 선택해주세요');
      return;
    }

    setUploading(true);

    try {
      // Upload files sequentially
      for (const file of files) {
        await uploadDocumentAsync(file, selectedBotId);
        toast.success(`${file.name} 업로드가 시작되었습니다`);
      }

      onClose();
      setFiles([]);
    } catch (error) {
      toast.error('업로드 실패: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      setFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] sm:w-[65vw] sm:!max-w-4xl">
        <DialogHeader>
          <DialogTitle>문서 업로드</DialogTitle>
          <DialogDescription>
            PDF, TXT, DOCX 파일을 업로드하여 지식베이스에 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!uploading ? (
            <FileDropzone files={files} onFilesChange={setFiles} />
          ) : (
            <UploadProgress files={files} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            취소
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? '업로드 중...' : `업로드 (${files.length}개)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
