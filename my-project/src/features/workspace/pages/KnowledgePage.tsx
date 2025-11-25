import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronRight, Plus, Search, Tag as TagIcon, X } from 'lucide-react';
import { KnowledgeGrid } from '@/features/knowledge/components/KnowledgeGrid';
import type { Knowledge } from '@/data/mockKnowledge';
import { useUIStore } from '@shared/stores/uiStore';
import { DocumentUploadModal } from '@/features/documents/components/monitoring/DocumentUploadModal';
import { documentsApi } from '@/features/documents/api/documentsApi';
import { cn } from '@/shared/components/utils';
import { Badge } from '@/shared/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';

export function KnowledgePage() {
  const { language } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.listDocuments({
        status: 'done', // 완료된 문서만 조회
        limit: 100,
        offset: 0,
      });

      // Document를 Knowledge 형식으로 변환
      const knowledgeList: Knowledge[] = response.documents.map((doc) => {
        const tags = [doc.status];
        if (doc.file_extension) {
          tags.push(doc.file_extension.toUpperCase());
        }

        return {
          id: doc.document_id,
          user_id: '', // Document API에는 user_id가 없음
          name: doc.original_filename,
          description: `${doc.file_extension.toUpperCase()} 파일 (${(doc.file_size / 1024).toFixed(2)} KB)`,
          tags,
          document_count: 1,
          documents: [doc],
          created_at: doc.created_at,
          updated_at: doc.updated_at || doc.created_at,
        };
      });

      // 디버깅용 목업 데이터 추가
      const mockKnowledge: Knowledge[] = [
        {
          id: 'mock-1',
          user_id: 'user-1',
          name: '제품 매뉴얼 가이드',
          description: '제품 사용 방법과 주요 기능에 대한 상세 설명 문서입니다. 초보자도 쉽게 따라할 수 있습니다.',
          tags: ['매뉴얼', 'PDF', '제품'],
          document_count: 5,
          documents: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          user_id: 'user-1',
          name: 'API 레퍼런스 문서',
          description: 'REST API 엔드포인트와 사용 예시를 포함한 개발자용 참조 문서입니다.',
          tags: ['API', 'TXT'],
          document_count: 3,
          documents: [],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'mock-3',
          user_id: 'user-1',
          name: '고객 FAQ 모음',
          description: '자주 묻는 질문과 답변을 정리한 문서입니다.',
          tags: ['FAQ', 'PDF', '고객지원', '문의'],
          document_count: 12,
          documents: [],
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'mock-4',
          user_id: 'user-1',
          name: '내부 정책 문서',
          description: '',
          tags: [],
          document_count: 1,
          documents: [],
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      const combinedList = [...mockKnowledge, ...knowledgeList];
      setKnowledgeList(combinedList);

      // 태그 목록 추출 (상태 / 파일 확장자)
      const tagSet = new Set<string>();
      combinedList.forEach((k) => k.tags.forEach((tag) => tagSet.add(tag)));
      setAllTags(Array.from(tagSet));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('문서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 문서 목록 조회 (Document API 사용)
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, searchQuery, selectedTags, language]);

  const filteredKnowledge = useMemo(() => {
    return knowledgeList.filter((knowledge) => {
      if (
        searchQuery &&
        !knowledge.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !knowledge.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => knowledge.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [knowledgeList, searchQuery, selectedTags]);

  const sortedKnowledge = useMemo(() => {
    const sorted = [...filteredKnowledge];
    sorted.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    return sorted;
  }, [filteredKnowledge]);

  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [allTags, tagSearchQuery]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImportFromFile = () => {
    setUploadModalOpen(true);
  };

  const handleUploadComplete = () => {
    void fetchDocuments();
  };

  const handleKnowledgeClick = (knowledgeId: string) => {
    console.log('Knowledge clicked:', knowledgeId);
  };

  const handleDeleteKnowledge = async (documentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await documentsApi.deleteDocument(documentId);
      
      // 목록에서 제거
      setKnowledgeList((prev) => prev.filter((k) => k.id !== documentId));
      
      console.log('Document deleted:', documentId);
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('문서 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="px-20 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Knowledge</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-2">Knowledge</h1>
            <p className="text-gray-600 text-sm">업로드된 지식을 한곳에서 관리하고 빠르게 검색하세요.</p>
          </div>
          <button
            onClick={handleImportFromFile}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            새 문서
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-sm transition-colors bg-gray-900 text-white"
            >
              모두
            </button>
          </div>

          {/* Tag Filter + Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1">
                {/* 검색 토글 */}
                <div className="relative flex items-center">
                  <div
                    className={cn(
                      'flex items-center overflow-hidden transition-all duration-300 ease-out',
                      isSearchExpanded ? 'w-72' : 'w-8'
                    )}
                  >
                    {isSearchExpanded ? (
                      <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onBlur={() => {
                            if (!searchQuery) {
                              setIsSearchExpanded(false);
                            }
                          }}
                          placeholder="문서 검색..."
                          className="w-full h-8 pl-8 pr-8 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchExpanded(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setIsSearchExpanded(true)}
                              className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                                searchQuery.length > 0
                                  ? 'text-gray-700'
                                  : 'text-gray-400 hover:text-gray-500'
                              )}
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>검색</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* 태그 필터 드롭다운 */}
                <TooltipProvider delayDuration={300}>
                  <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                              selectedTags.length > 0
                                ? 'text-gray-700'
                                : 'text-gray-400 hover:text-gray-500'
                            )}
                          >
                            <TagIcon className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{selectedTags.length > 0 ? `태그 (${selectedTags.length})` : '모든 태그'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* 태그 검색 */}
                      <div className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                          <input
                            type="text"
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            placeholder="태그 검색..."
                            className="w-full h-8 pl-8 pr-3 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {/* 태그 목록 */}
                      <div className="max-h-[320px] overflow-y-auto">
                        {allTags.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">태그 없음</div>
                        ) : filteredTags.length > 0 ? (
                          filteredTags.map((tag) => (
                            <DropdownMenuCheckboxItem
                              key={tag}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagClick(tag)}
                            >
                              {tag}
                            </DropdownMenuCheckboxItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">검색 결과 없음</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>

            {/* 선택된 태그 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    <span>{tag}</span>
                    <X className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Grid */}
        <KnowledgeGrid
          knowledgeList={sortedKnowledge}
          loading={loading}
          error={error}
          language={language}
          onKnowledgeClick={handleKnowledgeClick}
          onDeleteKnowledge={handleDeleteKnowledge}
        />
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
