export interface DocumentInfo {
  document_id: string;
  bot_id: string;
  original_filename: string;
  file_extension: string;
  file_size: number;
  status: string;
  chunk_count?: number | null;
  processing_time?: number | null;
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Knowledge {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tags: string[];
  document_count: number;
  documents?: DocumentInfo[];
  created_at: string;
  updated_at: string;
}

export const mockKnowledge: Knowledge[] = [
  {
    id: 'kb-1',
    user_id: 'user-1',
    name: '크래프톤정글생활교육지침.txt',
    description: 'HQ - 백터 관련 가이드 문서',
    tags: ['HQ', '백터'],
    document_count: 1,
    documents: [],
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2025-11-16T08:00:00Z',
  },
  {
    id: 'kb-2',
    user_id: 'user-1',
    name: 'Product Documentation',
    description: 'Complete product specifications and user guides',
    tags: ['product', 'documentation'],
    document_count: 15,
    documents: [],
    created_at: '2025-11-10T14:30:00Z',
    updated_at: '2025-11-14T16:00:00Z',
  },
  {
    id: 'kb-3',
    user_id: 'user-1',
    name: 'API Reference',
    description: 'API endpoint documentation and examples',
    tags: ['api', 'reference', 'technical'],
    document_count: 8,
    documents: [],
    created_at: '2025-11-05T09:00:00Z',
    updated_at: '2025-11-12T11:30:00Z',
  },
  {
    id: 'kb-4',
    user_id: 'user-1',
    name: 'Customer Support Knowledge Base',
    description: 'FAQ and common customer issues',
    tags: ['support', 'customer', 'faq'],
    document_count: 25,
    documents: [],
    created_at: '2025-11-01T09:00:00Z',
    updated_at: '2025-11-15T14:20:00Z',
  },
  {
    id: 'kb-5',
    user_id: 'user-1',
    name: 'Internal Policies',
    description: 'Company policies and procedures',
    tags: ['policy', 'internal'],
    document_count: 12,
    documents: [],
    created_at: '2025-10-20T11:00:00Z',
    updated_at: '2025-11-10T10:30:00Z',
  },
];
