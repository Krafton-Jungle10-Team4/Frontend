import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

/**
 * OAuth Callback 페이지
 * Google OAuth 인증 완료 후 리다이렉트되는 페이지
 *
 * 흐름:
 * 1. Google 로그인 완료
 * 2. 백엔드가 JWT 토큰을 쿼리 파라미터로 전달
 * 3. handleAuthCallback()으로 토큰 추출 및 사용자 정보 조회
 * 4. 성공 시 홈으로 이동, 실패 시 로그인 페이지로 이동
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { handleAuthCallback, error } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleAuthCallback();
        // 성공 시 홈으로 이동
        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        console.error('OAuth callback failed:', err);
        // 실패 시 로그인 페이지로 이동
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    processCallback();
  }, [handleAuthCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-400 text-xl font-semibold">
              인증에 실패했습니다
            </div>
            <p className="text-blue-200">{error}</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
              <span className="text-xl font-semibold text-white">
                로그인 처리 중...
              </span>
            </div>
            <p className="text-blue-200">잠시만 기다려주세요</p>
          </>
        )}
      </div>
    </div>
  );
};
