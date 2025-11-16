import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { FILE_CONSTRAINTS } from '../../../constants/documentConstants';
import { formatBytes } from '@/shared/utils/format';
import { toast } from 'sonner';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ files, onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Validate file size and extension
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
      return {
        valid: false,
        error: `파일 크기는 최대 ${formatBytes(FILE_CONSTRAINTS.MAX_SIZE)}까지 허용됩니다`,
      };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `허용되는 파일 형식: ${FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`,
      };
    }

    return { valid: true };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];

    droppedFiles.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          group border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-green-400 hover:bg-green-50/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="h-10 w-10 text-muted-foreground mb-4 transition-colors group-hover:text-green-500" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">파일을 여기에 놓아주세요...</p>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium mb-1 transition-colors group-hover:text-green-600">
              파일을 드래그하거나 클릭하여 선택하세요
            </p>
            <p className="text-xs text-muted-foreground transition-colors group-hover:text-green-500">
              PDF, TXT, DOCX (최대 10MB)
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">선택된 파일 ({files.length}개)</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-secondary"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
