import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { Knowledge, DocumentInfo } from '@/data/mockKnowledge';

interface KnowledgeApiResponse {
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

interface GetKnowledgeParams {
  tags?: string[];
  search?: string;
  skip?: number;
  limit?: number;
  include_documents?: boolean;
}

export const knowledgeApi = {
  /**
   * 지식 목록 조회
   */
  async getKnowledgeList(
    params?: GetKnowledgeParams
  ): Promise<Knowledge[]> {
    const { data } = await apiClient.get<KnowledgeApiResponse[]>(
      API_ENDPOINTS.KNOWLEDGE.LIST,
      {
        params: {
          tags: params?.tags,
          search: params?.search,
          skip: params?.skip ?? 0,
          limit: params?.limit ?? 50,
          include_documents: params?.include_documents ?? true,
        },
      }
    );

    return data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      description: item.description || '',
      tags: item.tags || [],
      document_count: item.document_count || 0,
      documents: item.documents || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  },

  /**
   * 지식 상세 조회
   */
  async getKnowledgeDetail(
    knowledgeId: string,
    includeDocuments: boolean = true
  ): Promise<Knowledge> {
    const { data } = await apiClient.get<KnowledgeApiResponse>(
      API_ENDPOINTS.KNOWLEDGE.DETAIL(knowledgeId),
      {
        params: {
          include_documents: includeDocuments,
        },
      }
    );

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || '',
      tags: data.tags || [],
      document_count: data.document_count || 0,
      documents: data.documents || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * 사용 가능한 태그 조회
   */
  async getAvailableTags(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      API_ENDPOINTS.KNOWLEDGE.TAGS
    );
    return data;
  },
};

