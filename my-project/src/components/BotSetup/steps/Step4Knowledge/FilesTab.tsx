import { Upload, X, Loader2, FileIcon, CheckCircle2 } from 'lucide-react';
import { useBotSetup } from '../../BotSetupContext';
import { ApiClient } from '../../../../utils/api';
import { isValidFileType, isValidFileSize } from '../../../../utils/validation';
import { formatFileSize } from '../../../../utils/format';
import { FILE_UPLOAD } from '../../../../utils/constants';
import { generateTempId } from '../../../../utils/session';
import { toast } from 'sonner';
import type { Language } from '../../../../contexts/AppContext';
import type { FileStatus } from '../../types';

interface FilesTabProps {
  language: Language;
}

export function FilesTab({ language }: FilesTabProps) {
  const { files, setFiles } = useBotSetup();

  const translations = {
    en: {
      dragAndDrop: "Drag 'n' drop files here, or click to select",
      fileUsage: 'You will be able to add more later.',
      uploadingFiles: 'Uploading Files:',
      uploaded: 'Uploaded',
      deleting: 'Deleting...',
      maxSize: `Max ${FILE_UPLOAD.MAX_SIZE_MB}MB per file`,
      allowedTypes: 'PDF, TXT, MD, DOCX',
    },
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

  const t = translations[language];
  
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const maxTotalSize = FILE_UPLOAD.MAX_SIZE_MB * 1024 * 1024; // Convert to bytes

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles).filter((file) => {
      // Validate file type
      if (!isValidFileType(file, FILE_UPLOAD.ALLOWED_TYPES)) {
        toast.error(`${file.name}: Unsupported file type`);
        return false;
      }
      
      // Validate file size
      if (!isValidFileSize(file, FILE_UPLOAD.MAX_SIZE_MB)) {
        toast.error(`${file.name}: File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB`);
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
        const data = await ApiClient.uploadFile(fileItem.file);

        // Update file with backend document_id and mark as uploaded
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  id: data.document_id,
                  status: 'uploaded' as FileStatus,
                }
              : f
          )
        );

        toast.success(`${fileItem.file.name} uploaded successfully`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to upload ${fileItem.file.name}: ${errorMessage}`);
        setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
        console.error('File upload error:', error);
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
      await ApiClient.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success(language === 'ko' ? '파일이 삭제되었습니다' : 'File deleted successfully');
    } catch (error) {
      // Revert status on error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'uploaded' as FileStatus } : f
        )
      );
      toast.error(language === 'ko' ? '파일 삭제 실패' : 'Failed to delete file');
      console.error('File delete error:', error);
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
          {formatFileSize(totalSize)} / {FILE_UPLOAD.MAX_SIZE_MB} MB. {t.fileUsage}
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
                      <span className="hidden sm:inline">Uploading...</span>
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
                        title="Delete file"
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
