import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from '@remixicon/react';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { ROUTES } from '@/shared/constants/routes';
import { ERROR_MESSAGES } from '@/shared/constants/errorMessages';

import { useAuth } from '../hooks/useAuth';

/**
 * 로그인 페이지 - 웹 최적화 버전
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  /**
   * 구글 로그인 성공 처리
   */
  const handleGoogleLoginSuccess = async (credential: string) => {
    try {
      setError(null);
      await login(credential);

      // 로그인 성공 시 홈으로 이동
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error('Login failed:', err);
      setError(
        (err as { message?: string })?.message ||
          ERROR_MESSAGES.AUTH.GOOGLE_LOGIN_FAILED
      );
    }
  };

  /**
   * 구글 로그인 실패 처리
   */
  const handleGoogleLoginError = (error: Error) => {
    console.error('Google login error:', error);
    setError(ERROR_MESSAGES.AUTH.GOOGLE_LOGIN_FAILED);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 px-4 py-10">
      <button
        onClick={() => navigate(ROUTES.LANDING)}
        className="self-start rounded-lg bg-white/5 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:text-blue-300"
      >
        <span className="flex items-center gap-2">
          <RiArrowLeftLine className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </span>
      </button>

      <main className="flex flex-1 items-center justify-center">
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
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              disabled={isLoading}
            />

            {isLoading && (
              <div className="text-center text-blue-200">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  <span>Signing in...</span>
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

      <footer className="mt-6 text-center text-sm text-blue-200/60">
        Don't have an account?{' '}
        <button
          onClick={() => navigate(ROUTES.LANDING)}
          className="font-medium text-blue-300 underline hover:text-blue-200"
        >
          Get Started
        </button>
      </footer>
    </div>
  );
};
