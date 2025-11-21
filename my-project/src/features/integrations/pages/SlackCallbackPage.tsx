/**
 * Slack OAuth Callback Page
 * Slack OAuth 인증 완료 후 리다이렉트되는 페이지
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function SlackCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Slack 연동을 처리하는 중...');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const success = searchParams.get('slack');
      const botId = searchParams.get('bot_id');

      // Slack OAuth 에러가 있는 경우
      if (error) {
        setStatus('error');
        setMessage(`Slack 연동 실패: ${error}`);
        
        setTimeout(() => {
          if (botId) {
            navigate(`/workspace/studio/${botId}`);
          } else {
            navigate('/workspace/studio');
          }
        }, 2000);
        return;
      }

      // OAuth 콜백: code와 state가 있는 경우 백엔드로 전달
      if (code && state) {
        try {
          setStatus('loading');
          setMessage('Slack 연동을 처리하는 중...');

          console.log('[SlackCallback] Processing OAuth:', { code: code.substring(0, 10) + '...', state: state.substring(0, 10) + '...' });

          // 백엔드 OAuth 콜백 엔드포인트로 브라우저를 직접 리다이렉트
          // 환경변수에서 백엔드 URL을 가져오거나, 로컬 개발 환경에서는 localhost:8001 사용
          // 프로덕션: VITE_API_URL이 AWS Secrets Manager에서 주입됨 (예: https://api.snapagent.shop)
          // 로컬: VITE_API_URL이 없으면 http://localhost:8001 사용
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
          window.location.href = `${backendUrl}/api/v1/slack/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
          return;

        } catch (err) {
          console.error('[SlackCallback] OAuth processing failed:', err);
          setStatus('error');
          setMessage('Slack 연동 처리 중 오류가 발생했습니다.');
          
          setTimeout(() => {
            navigate('/workspace/studio');
          }, 2000);
          return;
        }
      }

      // 이미 처리된 성공 케이스
      if (success === 'success') {
        setStatus('success');
        setMessage('Slack 연동이 완료되었습니다!');
        
        setTimeout(() => {
          if (botId) {
            navigate(`/workspace/studio/${botId}`);
          } else {
            navigate('/workspace/studio');
          }
        }, 1000);
        return;
      }

      // 그 외의 경우
      setStatus('error');
      setMessage('잘못된 요청입니다.');
      setTimeout(() => {
        navigate('/workspace/studio');
      }, 2000);
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
              <h2 className="text-2xl font-semibold text-gray-800">처리 중...</h2>
              <p className="text-gray-600 text-center">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">성공!</h2>
              <p className="text-gray-600 text-center">{message}</p>
              <p className="text-sm text-gray-500">잠시 후 이동합니다...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">오류 발생</h2>
              <p className="text-gray-600 text-center">{message}</p>
              <p className="text-sm text-gray-500">잠시 후 돌아갑니다...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

