/**
 * DocumentList Component
 * 문서 목록 컴포넌트
 */

import type { Document } from '../types/document.types';

interface DocumentListProps {
  documents: Document[];
  onSelect?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  language?: 'en' | 'ko';
}

export function DocumentList({ documents, onSelect, onDelete, language = 'ko' }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        {language === 'ko' ? '문서가 없습니다' : 'No documents'}
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-500 transition-colors cursor-pointer"
          onClick={() => onSelect?.(document)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {document.filename}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
            </p>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
