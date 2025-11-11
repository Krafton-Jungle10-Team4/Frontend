import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

const TOKEN_REFRESH_GRACE_MS = 60 * 1000; // 만료 1분 전 갱신

interface DecodedJWT {
  exp?: number;
}

const decodeJwt = (token: string): DecodedJWT => {
  const [, payload] = token.split('.');
  if (!payload) return {};
  try {
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

export async function getFreshAccessToken(): Promise<string> {
  const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  if (!token) {
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  const { exp } = decodeJwt(token);
  const now = Date.now();

  if (exp && now >= exp * 1000 - TOKEN_REFRESH_GRACE_MS) {
    const { data } = await apiClient.post<{ access_token: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      {},
      { withCredentials: true }
    );

    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, data.access_token);
    return data.access_token;
  }

  return token;
}
