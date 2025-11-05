import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from '@remixicon/react';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { ROUTES } from '@/shared/constants/routes';

import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

/**
 * 로그인 페이지 (SnapAgent OAuth)
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { redirectToGoogleLogin, isLoading, error } = useAuth();
  const loginWithMockUser = useAuthStore((state) => state.loginWithMockUser);

  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}${ROUTES.AUTH_CALLBACK}`;
    redirectToGoogleLogin(callbackUrl);
  };

  const handleMockLogin = () => {
    loginWithMockUser();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Space Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-teal-900">
        {/* Stars Layer 1 - Small stars */}
        <div className="absolute inset-0 opacity-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={`star1-${i}`}
              className="absolute w-1 h-1 bg-teal-300 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 2 - Medium stars */}
        <div className="absolute inset-0 opacity-70">
          {[...Array(30)].map((_, i) => (
            <div
              key={`star2-${i}`}
              className="absolute w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 3 - Large stars */}
        <div className="absolute inset-0 opacity-80">
          {[...Array(20)].map((_, i) => (
            <div
              key={`star3-${i}`}
              className="absolute w-2 h-2 bg-teal-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-0"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `-100px`,
                transform: 'rotate(45deg)',
                animation: `shooting ${5 + i * 2}s linear infinite`,
                animationDelay: `${i * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Nebula effect */}
        <div className="absolute inset-0 bg-gradient-radial from-teal-400/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-white/20 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => navigate(ROUTES.LANDING)}
              className="absolute top-4 left-4 rounded-full p-2 text-white/70 backdrop-blur-sm transition-colors hover:text-white hover:bg-white/10"
              aria-label="뒤로 가기"
            >
              <RiArrowLeftLine className="h-6 w-6" />
            </button>
            <header className="space-y-2 text-center pt-8">
              <h1 className="text-3xl font-bold text-white">
                환영합니다
              </h1>
              <p className="text-sm text-teal-200">
                SnapAgent를 계속 사용하려면 로그인하세요
              </p>
            </header>

            {error && (
              <div
                className="rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-center text-sm text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="space-y-6">
              <GoogleLoginButton
                onClick={handleGoogleLogin}
                disabled={isLoading}
              />

              {/* Mock 로그인 버튼 (로컬 개발용) */}
              {useMockAuth && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white/10 px-4 text-teal-200">
                        로컬 개발용
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleMockLogin}
                    className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 font-medium text-white transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                  >
                    🚀 목업 로그인 (개발자 모드)
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="text-center text-teal-200">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                    <span>Google로 리디렉션 중...</span>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-white/10 pt-6 text-center text-xs text-teal-200/70 leading-relaxed">
              로그인하시면 당사의{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-teal-200 underline"
              >
                서비스 이용약관
              </a>
              {' '}및{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-teal-200 underline"
              >
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </footer>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 text-center text-sm text-teal-200/60">
          계정이 없으신가요?{' '}
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="font-medium text-teal-300 underline hover:text-teal-200"
          >
            시작하기
          </button>
        </footer>
      </div>
      {/* Shooting star animation keyframes - Add to global CSS if needed */}
      <style>{`
        @keyframes shooting {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) rotate(135deg);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(100vh) rotate(135deg);
          }
        }
      `}</style>
    </div>
  );
};
