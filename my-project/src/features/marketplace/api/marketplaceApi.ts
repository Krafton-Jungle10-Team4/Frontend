import { apiClient } from '@/shared/api/client';

export interface MarketplaceItemCreate {
  workflow_version_id: string;
  display_name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  screenshots?: string[];
  readme?: string;
  use_cases?: string[];
}

export interface PublisherInfo {
  team_id: string;
  team_name?: string;
  user_id?: string;
  username?: string;
}

export interface WorkflowVersionInfo {
  id: string;
  bot_id: string;
  version: string;
  node_count?: number;
  edge_count?: number;
  input_schema?: any;
  output_schema?: any;
}

export interface MarketplaceItem {
  id: string;
  workflow_version_id: string;
  display_name: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  screenshots?: string[];
  is_active: boolean;
  status: string;
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
  readme?: string;
  use_cases?: string[];
  published_at: string;
  updated_at: string;
  publisher?: PublisherInfo;
  workflow_version?: WorkflowVersionInfo;
}

export interface MarketplaceListResponse {
  items: MarketplaceItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MarketplaceFilterParams {
  page?: number;
  page_size?: number;
  category?: string;
  tags?: string;
  search?: string;
  sort_by?: 'latest' | 'popular' | 'rating';
}

/**
 * 마켓플레이스에 게시
 */
export const publishToMarketplace = async (
  data: MarketplaceItemCreate
): Promise<MarketplaceItem> => {
  const response = await apiClient.post('/api/v1/marketplace/publish', data);
  return response.data;
};

/**
 * 마켓플레이스 목록 조회
 */
export const getMarketplaceItems = async (
  filters: MarketplaceFilterParams
): Promise<MarketplaceListResponse> => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.tags) params.append('tags', filters.tags);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.page_size || 20));

  const response = await apiClient.get(`/api/v1/marketplace?${params.toString()}`);
  return response.data;
};

/**
 * 마켓플레이스 아이템 상세 조회
 */
export const getMarketplaceItem = async (
  itemId: string
): Promise<MarketplaceItem> => {
  const response = await apiClient.get(`/api/v1/marketplace/${itemId}`);
  return response.data;
};

/**
 * 다운로드 카운트 증가
 */
export const incrementDownloadCount = async (
  itemId: string
): Promise<void> => {
  await apiClient.post(`/api/v1/marketplace/${itemId}/download`);
};

/**
 * 마켓플레이스 아이템 수정
 */
export const updateMarketplaceItem = async (
  itemId: string,
  data: Partial<MarketplaceItemCreate>
): Promise<MarketplaceItem> => {
  const response = await apiClient.put(`/api/v1/marketplace/${itemId}`, data);
  return response.data;
};

/**
 * 마켓플레이스 아이템 삭제
 */
export const deleteMarketplaceItem = async (
  itemId: string
): Promise<void> => {
  await apiClient.delete(`/api/v1/marketplace/${itemId}`);
};

/**
 * 마켓플레이스 워크플로우 가져오기
 */
export interface ImportWorkflowResponse {
  message: string;
  bot_id: string;
  bot_name: string;
  workflow_version_id: string;
  cloned_libraries_count: number;
}

export const importMarketplaceWorkflow = async (
  itemId: string
): Promise<ImportWorkflowResponse> => {
  const response = await apiClient.post(`/api/v1/marketplace/${itemId}/import`);
  return response.data;
};
