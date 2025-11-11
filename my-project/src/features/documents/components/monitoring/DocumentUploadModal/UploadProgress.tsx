import React from 'react';
import { Progress } from '@/shared/components/progress';
import { Loader2 } from 'lucide-react';
import { useUploadProgress } from '../../../stores/selectors';

interface UploadProgressProps {
  files: File[];
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ files }) => {
  const progress = useUploadProgress();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">파일 업로드 중...</p>
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>

      <div className="space-y-1">
        {files.map((file, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            • {file.name}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        업로드가 완료되면 자동으로 처리가 시작됩니다.
      </p>
    </div>
  );
};
