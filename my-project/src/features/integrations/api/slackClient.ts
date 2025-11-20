/**
 * Slack Integration API Client
 * Slack 연동 API 클라이언트
 */
import { apiClient } from '@/shared/api/client';
import {
  SlackIntegration,
  SlackChannel,
  SlackConnectRequest,
  SlackConnectResponse,
} from '../types';

const BASE_URL = '/api/v1/slack';

export const slackClient = {
  /**
   * Slack OAuth 연동 시작
   */
  async connect(botId?: string): Promise<SlackConnectResponse> {
    const params = botId ? { bot_id: botId } : {};
    const response = await apiClient.get<SlackConnectResponse>(
      `${BASE_URL}/oauth/connect`,
      { params }
    );
    return response.data;
  },

  /**
   * 모든 Slack 연동 조회
   */
  async listIntegrations(): Promise<SlackIntegration[]> {
    const response = await apiClient.get<SlackIntegration[]>(
      `${BASE_URL}/integrations`
    );
    return response.data;
  },

  /**
   * 특정 Slack 연동 조회
   */
  async getIntegration(integrationId: number): Promise<SlackIntegration> {
    const response = await apiClient.get<SlackIntegration>(
      `${BASE_URL}/integrations/${integrationId}`
    );
    return response.data;
  },

  /**
   * Slack 연동 삭제
   */
  async deleteIntegration(integrationId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/integrations/${integrationId}`);
  },

  /**
   * Slack 채널 목록 조회
   */
  async getChannels(integrationId: number): Promise<SlackChannel[]> {
    const response = await apiClient.get<SlackChannel[]>(
      `${BASE_URL}/integrations/${integrationId}/channels`
    );
    return response.data;
  },

  /**
   * 특정 봇의 Slack 연동 조회
   */
  async getBotIntegration(botId: string): Promise<SlackIntegration | null> {
    const response = await apiClient.get<SlackIntegration | null>(
      `${BASE_URL}/bot/${botId}/integration`
    );
    return response.data;
  },
};

