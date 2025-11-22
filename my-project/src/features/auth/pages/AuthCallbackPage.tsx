import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import '../authStyles.css';

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
        // 성공 시 워크스페이스 스튜디오로 이동
        navigate(ROUTES.WORKSPACE_STUDIO, { replace: true });
      } catch (err) {
        console.error('OAuth callback failed:', err);
        // 실패 시 로그인 페이지로 이동
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    processCallback();
  }, [handleAuthCallback, navigate]);

  return (
    <div className="auth-page">
      <div className="callback-ambient" />
      <div className="callback-card" role="status" aria-live="polite">
        <div className="callback-node" />
        {error ? (
          <>
            <div className="callback-title">인증에 실패했습니다</div>
            <p className="callback-sub callback-error">{error}</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="callback-action"
              type="button"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        ) : (
          <>
            <div className="callback-title">워크스페이스 준비 중...</div>
            <p className="callback-sub">잠시만 기다려주세요, 곧 이동합니다.</p>
          </>
        )}
      </div>
    </div>
  );
};
