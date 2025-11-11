import React from 'react';
import { FileX } from 'lucide-react';

export const DocumentTableEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">문서가 없습니다</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        업로드된 문서가 없습니다.
        <br />
        상단의 "업로드" 버튼을 클릭하여 문서를 추가하세요.
      </p>
    </div>
  );
};
