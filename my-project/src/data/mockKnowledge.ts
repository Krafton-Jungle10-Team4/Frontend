export interface Knowledge {
  id: string;
  name: string;
  description: string;
  tags: string[];
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export const mockKnowledge: Knowledge[] = [
  {
    id: 'kb-1',
    name: '크래프톤정글생활교육지침.txt',
    description: 'HQ - 백터 관련 가이드 문서',
    tags: ['HQ', '백터'],
    documentCount: 1,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2025-11-16T08:00:00Z',
  },
  {
    id: 'kb-2',
    name: 'Product Documentation',
    description: 'Complete product specifications and user guides',
    tags: ['product', 'documentation'],
    documentCount: 15,
    createdAt: '2025-11-10T14:30:00Z',
    updatedAt: '2025-11-14T16:00:00Z',
  },
  {
    id: 'kb-3',
    name: 'API Reference',
    description: 'API endpoint documentation and examples',
    tags: ['api', 'reference', 'technical'],
    documentCount: 8,
    createdAt: '2025-11-05T09:00:00Z',
    updatedAt: '2025-11-12T11:30:00Z',
  },
  {
    id: 'kb-4',
    name: 'Customer Support Knowledge Base',
    description: 'FAQ and common customer issues',
    tags: ['support', 'customer', 'faq'],
    documentCount: 25,
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2025-11-15T14:20:00Z',
  },
  {
    id: 'kb-5',
    name: 'Internal Policies',
    description: 'Company policies and procedures',
    tags: ['policy', 'internal'],
    documentCount: 12,
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2025-11-10T10:30:00Z',
  },
];
