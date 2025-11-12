/**
 * API client functions
 */

import { API_BASE_URL } from './constants';

export class ApiClient {
  /**
   * Upload a file to the server (비동기)
   *
   * 엔드포인트: POST /api/v1/documents/upload-async
   *
   * 비동기 처리: 파일이 S3에 업로드되고 SQS 큐에 추가됩니다.
   * 반환된 job_id로 처리 상태를 추적할 수 있습니다.
   */
  static async uploadFile(
    file: File,
    botId: string
  ): Promise<{
    job_id: string;
    status: string;
    message: string;
    estimated_time?: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    // JWT 토큰 가져오기
    const token = localStorage.getItem('jwt_token');
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // botId를 쿼리 파라미터로 추가
    const url = new URL(`${API_BASE_URL}/api/v1/documents/upload-async`);
    url.searchParams.append('bot_id', botId);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed with status ${response.status}`
      );
    }

    return response.json();
  }

  /**
   * Delete a file from the server
   */
  static async deleteFile(documentId: string, botId: string): Promise<void> {
    const url = new URL(`${API_BASE_URL}/api/v1/documents/${documentId}`);
    url.searchParams.append('bot_id', botId);

    const response = await fetch(url.toString(), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  }

  /**
   * Discover URLs from a website
   */
  static async discoverUrls(
    url: string,
    sessionId: string
  ): Promise<{
    websiteId: string;
    discoveredUrls: Array<{
      id: string;
      path: string;
      children?: any[];
      selected: boolean;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/websites/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Discovery failed');
    }

    return response.json();
  }

  /**
   * Refine a prompt using LLM
   */
  static async refinePrompt(
    prompt: string
  ): Promise<{ refinedPrompt: string }> {
    const response = await fetch(`${API_BASE_URL}/api/refine-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Refine failed');
    }

    return response.json();
  }

  /**
   * Create a new bot
   */
  static async createBot(data: {
    name: string;
    goal: string;
    descriptionSource: 'website' | 'text';
    websiteUrl?: string;
    personalityText?: string;
    knowledgeText: string;
    sessionId: string;
  }): Promise<{
    botId: string;
    name: string;
    createdAt: string;
    status: 'training' | 'ready';
  }> {
    const response = await fetch(`${API_BASE_URL}/api/bots/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Bot creation failed');
    }

    return response.json();
  }

  /**
   * Cleanup knowledge data for a session
   */
  static async cleanupKnowledge(sessionId: string): Promise<{
    deletedFiles: number;
    deletedWebsites: number;
    success: boolean;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/knowledge/cleanup`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Cleanup failed');
    }

    return response.json();
  }

  /**
   * Get bot training status
   */
  static async getTrainingStatus(botId: string): Promise<{
    progress: number;
    currentStep: number;
    stepDescription: string;
    isComplete: boolean;
    estimatedTimeRemaining?: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/bots/${botId}/training-status`
    );

    if (!response.ok) {
      throw new Error('Failed to get training status');
    }

    return response.json();
  }

  /**
   * Send a chat message
   */
  static async sendChatMessage(
    botId: string,
    sessionId: string,
    message: string,
    userId?: string
  ): Promise<{
    messageId: string;
    botResponse: string;
    timestamp: string;
    sources?: Array<{
      type: string;
      title: string;
      url?: string;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, sessionId, message, userId }),
    });

    if (!response.ok) {
      throw new Error('Chat failed');
    }

    return response.json();
  }

  /**
   * Generate share link for a bot
   */
  static async shareBot(botId: string): Promise<{
    shareUrl: string;
    shareId: string;
    expiresAt?: string;
    accessToken?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/bots/${botId}/share`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Share failed');
    }

    return response.json();
  }
}
