/**
 * API client functions
 */

import { API_BASE_URL } from './constants';

export class ApiClient {
  /**
   * Upload a file to the server
   */
  static async uploadFile(file: File): Promise<{
    document_id: string;
    filename: string;
    file_size: number;
    chunk_count: number;
    processing_time: number;
    status: string;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
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
  static async deleteFile(documentId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    );

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
