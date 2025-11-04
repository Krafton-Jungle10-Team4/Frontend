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
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
        {/* Stars Layer 1 - Small stars */}
        <div className="absolute inset-0 opacity-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={`star1-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
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
              className="absolute w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse"
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
              className="absolute w-2 h-2 bg-purple-200 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Nebula effect */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-4">
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="rounded-lg bg-white/5 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:text-blue-300"
          >
            <span className="flex items-center gap-2">
              <RiArrowLeftLine className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/20 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
            <header className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white">Welcome back</h1>
              <p className="text-sm text-blue-200">
                Sign in to continue to BotBuilder
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
                      <span className="bg-white/10 px-4 text-blue-200">
                        Local Development
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleMockLogin}
                    className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg"
                  >
                    🚀 Mock Login (Developer Mode)
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="text-center text-blue-200">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    <span>Redirecting to Google...</span>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-white/10 pt-6 text-center text-xs text-blue-200/70 leading-relaxed">
              By signing in, you agree to our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                Privacy Policy
              </a>
            </footer>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 text-center text-sm text-blue-200/60">
          Don't have an account?{' '}
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="font-medium text-blue-300 underline hover:text-blue-200"
          >
            Get Started
          </button>
        </footer>
      </div>
    </div>
  );
};
