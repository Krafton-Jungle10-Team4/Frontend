import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { LoginForm } from '../components/LoginForm';
import { ROUTES } from '@/shared/constants/routes';

import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import '../authStyles.css';

/**
 * 로그인 페이지 (SnapAgent OAuth)
 * 랜딩페이지와 동일한 화이트 테마
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { redirectToGoogleLogin, isLoading, error } = useAuth();
  const login = useAuthStore((state) => state.login);
  const loginWithMockUser = useAuthStore((state) => state.loginWithMockUser);

  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  const handleGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate(ROUTES.HOME);
    } catch (error) {
      // 에러는 authStore에서 처리됨
      console.error('Login failed:', error);
    }
  };

  const handleMockLogin = () => {
    loginWithMockUser();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient" />
      <main className="auth-shell">
        <div className="auth-card">
          <button className="auth-logo" onClick={() => navigate(ROUTES.LANDING)} type="button">
            <span className="auth-logo-mark">
              <span />
              <span />
              <span />
              <span />
            </span>
            SnapAgent
          </button>

          <div className="auth-headline">
            <h1>다시 오신 것을 환영합니다</h1>
            <p>워크스페이스에 로그인하세요.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <LoginForm onSubmit={handleEmailLogin} isLoading={isLoading} error={error} />

            <div className="auth-divider">
              <span>또는</span>
            </div>

            <GoogleLoginButton onClick={handleGoogleLogin} disabled={isLoading} className="auth-google" />

            {useMockAuth && (
              <button
                onClick={handleMockLogin}
                className="w-full rounded-lg px-4 py-3 font-medium text-white transition-all hover:opacity-95 auth-mock"
              >
                🚀 목업 로그인 (개발자 모드)
              </button>
            )}

            {isLoading && (
              <div className="text-center text-gray-600">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <span>로그인 중...</span>
                </div>
              </div>
            )}
          </div>

          <div className="auth-links">
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              이용약관
            </a>
            <span>•</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              개인정보처리방침
            </a>
          </div>
        </div>

        <div className="auth-footer">
          계정이 없으신가요?{' '}
          <button onClick={() => navigate(ROUTES.LANDING)} className="font-semibold text-indigo-600 underline">
            시작하기
          </button>
        </div>
      </main>
    </div>
  );
};
