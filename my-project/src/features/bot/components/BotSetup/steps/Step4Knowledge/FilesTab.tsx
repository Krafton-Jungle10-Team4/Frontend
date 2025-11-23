import { Upload, X, Loader2, FileIcon, CheckCircle2 } from 'lucide-react';
import { useBotSetup } from '../../BotSetupContext';
import { documentsService } from '@features/documents/services/documentsService';
import { useAsyncDocumentStore } from '@features/documents/stores/documentStore.async';
import { isAsyncUploadResponse } from '@features/documents/types/type-guards';
import { isValidFileType, isValidFileSize } from '@/shared/utils/validation';
import { formatFileSize } from '@/shared/utils/format';
import { FILE_UPLOAD } from '@/shared/utils/constants';
import { generateTempId } from '@/shared/utils/session';
import { toast } from 'sonner';
import type { Language } from '@/shared/types';
import type { FileStatus } from '../../types';

/**
 * Feature flag for async upload
 */
const isAsyncUploadEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_ASYNC_UPLOAD === 'true';
};

interface FilesTabProps {
  language?: Language;
}

export function FilesTab({ language: _language = 'ko' }: FilesTabProps) {
  const { files, setFiles, createdBotId } = useBotSetup();

  // Async document store (feature flag controlled)
  const asyncStore = useAsyncDocumentStore();

  const translations = {
    ko: {
      dragAndDrop: '파일을 드래그하거나 클릭하여 선택하세요',
      fileUsage: '나중에 더 추가할 수 있습니다.',
      uploadingFiles: '업로드 중인 파일:',
      uploaded: '업로드 완료',
      deleting: '삭제 중...',
      maxSize: `파일당 최대 ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
      allowedTypes: 'PDF, TXT, MD, DOCX',
    },
  };

  const t = translations.ko;

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles).filter((file) => {
      // Validate file type
      if (!isValidFileType(file, FILE_UPLOAD.ALLOWED_TYPES)) {
        toast.error(`${file.name}: 지원하지 않는 파일 형식입니다`);
        return false;
      }

      // Validate file size
      if (!isValidFileSize(file, FILE_UPLOAD.MAX_SIZE_MB)) {
        toast.error(
          `${file.name}: 파일 크기가 ${FILE_UPLOAD.MAX_SIZE_MB}MB를 초과합니다`
        );
        return false;
      }

      return true;
    });

    const newFiles = validFiles.map((file) => ({
      id: generateTempId(),
      file,
      status: 'uploading' as FileStatus,
    }));

    setFiles([...files, ...newFiles]);

    // Upload each file
    for (const fileItem of newFiles) {
      try {
        // Use createdBotId for file upload
        if (!createdBotId) {
          throw new Error('서비스가 아직 생성되지 않았습니다');
        }

        if (isAsyncUploadEnabled()) {
          // Use async store for upload (with polling)
          const jobId = await asyncStore.uploadDocumentAsync(
            fileItem.file,
            createdBotId
          );

          // Update UI with job ID
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    id: jobId,
                    status: 'uploaded' as FileStatus,
                  }
                : f
            )
          );
          toast.success(
            `${fileItem.file.name} 업로드 완료 - 백그라운드에서 처리됩니다`
          );
        } else {
          // Legacy flow: Use documentsService
          const response = await documentsService.uploadDocument(
            fileItem.file,
            createdBotId
          );

          // Handle async or sync response
          if (isAsyncUploadResponse(response)) {
            // Async upload - job queued
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? {
                      ...f,
                      id: response.jobId,
                      status: 'uploaded' as FileStatus,
                    }
                  : f
              )
            );
            toast.success(
              `${fileItem.file.name} 업로드 완료 - ${response.message}`
            );
          } else {
            // Legacy sync upload - processing complete
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? {
                      ...f,
                      id: response.document_id,
                      status: 'uploaded' as FileStatus,
                    }
                  : f
              )
            );
            toast.success(`${fileItem.file.name} 업로드가 완료되었습니다`);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error(`${fileItem.file.name} 업로드 실패: ${errorMessage}`);
        setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      }
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteFile = async (fileId: string) => {
    // Mark as deleting
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'deleting' as FileStatus } : f
      )
    );

    try {
      // Use createdBotId for file deletion
      if (!createdBotId) {
        throw new Error('서비스가 아직 생성되지 않았습니다');
      }

      if (isAsyncUploadEnabled()) {
        // Use async store for deletion
        await asyncStore.deleteDocument(fileId, createdBotId);
      } else {
        // Legacy flow: Use documentsService
        await documentsService.deleteDocument(fileId);
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success('파일이 삭제되었습니다');
    } catch {
      // Revert status on error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'uploaded' as FileStatus } : f
        )
      );
      toast.error('파일 삭제 실패');
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-400 transition-colors cursor-pointer bg-white"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className="mx-auto mb-3 text-gray-400" size={36} />
        <p className="text-gray-600 mb-1">{t.dragAndDrop}</p>
        <p className="text-sm text-gray-500">
          {formatFileSize(totalSize)} / {FILE_UPLOAD.MAX_SIZE_MB} MB.{' '}
          {t.fileUsage}
        </p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept={FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',')}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-gray-700">{t.uploadingFiles}</h4>
          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon size={20} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  {fileItem.status === 'uploading' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="hidden sm:inline">업로드 중...</span>
                    </div>
                  )}

                  {fileItem.status === 'uploaded' && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 size={16} />
                        <span className="hidden sm:inline">{t.uploaded}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(fileItem.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="파일 삭제"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {fileItem.status === 'deleting' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="hidden sm:inline">{t.deleting}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
