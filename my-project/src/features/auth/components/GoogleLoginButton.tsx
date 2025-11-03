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
        theme: 'filled_blue',
        size: 'large',
        width: 400,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }
  }, [isGoogleLoaded, onSuccess, onError]);

  if (!isGoogleLoaded) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-blue-200">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading Google Sign-In...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div
        id="google-login-button"
        className={`transition-opacity ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      />
      <style>{`
        #google-login-button iframe {
          min-height: 50px !important;
        }
      `}</style>
    </div>
  );
};
