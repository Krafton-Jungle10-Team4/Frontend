import { useEffect, useRef } from 'react';

import type { GoogleLoginResponse } from '@/types/auth';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: Error) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
}

/**
 * 구글 로그인 버튼 컴포넌트
 *
 * Google Identity Services를 사용하여 구글 로그인을 구현합니다.
 *
 * @example
 * <GoogleLoginButton
 *   onSuccess={(credential) => console.log('로그인 성공:', credential)}
 *   onError={(error) => console.error('로그인 실패:', error)}
 *   text="signin_with"
 *   theme="outline"
 * />
 */
export const GoogleLoginButton = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  width = 300,
}: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Google Identity Services 스크립트가 로드되었는지 확인
    if (!window.google) {
      console.error('Google Identity Services script not loaded');
      return;
    }

    // 구글 클라이언트 ID 확인
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
      return;
    }

    // 구글 로그인 초기화
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleLoginResponse) => {
        try {
          // credential은 JWT ID Token입니다
          onSuccess(response.credential);
        } catch (error) {
          onError?.(error as Error);
        }
      },
    });

    // 버튼 렌더링
    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: theme,
        size: size,
        text: text,
        width: width,
        logo_alignment: 'left',
      });
    }
  }, [onSuccess, onError, text, theme, size, width]);

  return <div ref={buttonRef} />;
};

// Google Identity Services 타입 정의
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleLoginResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type: 'standard' | 'icon';
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              width?: number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}
