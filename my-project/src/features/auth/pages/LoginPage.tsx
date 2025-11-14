import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from '@remixicon/react';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { LoginForm } from '../components/LoginForm';
import { ROUTES } from '@/shared/constants/routes';

import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
            <button
              onClick={() => navigate(ROUTES.LANDING)}
              className="absolute top-4 left-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <RiArrowLeftLine className="h-6 w-6" />
            </button>
            <header className="space-y-2 text-center pt-8">
              <h1 className="text-3xl font-bold text-gray-900">
                환영합니다
              </h1>
              <p className="text-sm text-gray-600">
                SnapAgent를 계속 사용하려면 로그인하세요
              </p>
            </header>

            {error && (
              <div
                className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* 일반 로그인 폼 */}
              <LoginForm
                onSubmit={handleEmailLogin}
                isLoading={isLoading}
                error={error}
              />

              {/* 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    또는
                  </span>
                </div>
              </div>

              {/* Google 로그인 */}
              <GoogleLoginButton
                onClick={handleGoogleLogin}
                disabled={isLoading}
              />

              {/* Mock 로그인 버튼 (로컬 개발용) */}
              {useMockAuth && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">
                        로컬 개발용
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleMockLogin}
                    className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 font-medium text-white transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-lg shadow-teal-500/30"
                  >
                    🚀 목업 로그인 (개발자 모드)
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="text-center text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                    <span>로그인 중...</span>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500 leading-relaxed">
              로그인하시면 당사의{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                서비스 이용약관
              </a>
              {' '}및{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </footer>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="font-medium text-teal-600 hover:text-teal-700 underline"
          >
            시작하기
          </button>
        </footer>
      </div>
    </div>
  );
};
