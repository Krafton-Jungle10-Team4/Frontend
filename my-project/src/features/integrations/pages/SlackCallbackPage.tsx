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
      const error = searchParams.get('error');
      const success = searchParams.get('slack');
      const botId = searchParams.get('bot_id');
      const tab = searchParams.get('tab');

      // 에러가 있는 경우
      if (error) {
        setStatus('error');
        setMessage(`연동 실패: ${error}`);
        
        // 2초 후 워크플로우 페이지로 이동 (배포 의존성 제거)
        setTimeout(() => {
          if (botId) {
            navigate(`/workspace/studio/${botId}`);
          } else {
            navigate('/workspace/studio');
          }
        }, 2000);
        return;
      }

      // 성공한 경우
      if (success === 'success') {
        setStatus('success');
        setMessage('Slack 연동이 완료되었습니다!');
        
        // 1초 후 워크플로우로 돌아가기
        setTimeout(() => {
          if (botId) {
            navigate(`/workspace/studio/${botId}`);
          } else {
            navigate('/workspace/studio');
          }
        }, 1000);
        return;
      }

      // 백엔드가 이미 리다이렉트 처리한 경우
      // URL이 /workspace/studio/:botId?slack=success 형태
      const pathname = window.location.pathname;
      if (pathname.includes('/workspace/studio/') && success === 'success') {
        setStatus('success');
        setMessage('Slack 연동이 완료되었습니다!');
        return;
      }

      // 그 외의 경우 홈으로 이동
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

