import { useState, useEffect } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleLoginButton = ({
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Google Identity Services 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        try {
          onSuccess(response.credential);
        } catch (error) {
          onError?.(error as Error);
        }
      },
    });

    const buttonDiv = document.getElementById('google-login-button');
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
      });
    }
  }, [isGoogleLoaded, onSuccess, onError]);

  if (!isGoogleLoaded) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="text-sm text-gray-500">Loading Google Sign-In...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div
        id="google-login-button"
        className={disabled ? 'pointer-events-none opacity-50' : ''}
      />
    </div>
  );
};
