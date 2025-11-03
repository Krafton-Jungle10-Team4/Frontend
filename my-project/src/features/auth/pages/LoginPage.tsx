import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '@/components/common/GoogleLoginButton';
import { ROUTES } from '@/constants/routes';
import { ERROR_MESSAGES } from '@/constants/errorMessages';

import { useAuth } from '../hooks/useAuth';

import './LoginPage.css';

/**
 * 로그인 페이지
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

      // 로그인 성공 시 대시보드로 이동
      navigate(ROUTES.DASHBOARD);
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>RAG Platform</h1>
          <p>로그인하여 시작하세요</p>
        </div>

        <div className="login-content">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <GoogleLoginButton
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            text="signin_with"
            theme="outline"
            size="large"
            width={300}
          />

          {isLoading && (
            <div className="loading-message">로그인 처리 중...</div>
          )}
        </div>

        <div className="login-footer">
          <p className="terms">
            로그인하면{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              이용약관
            </a>{' '}
            및{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
