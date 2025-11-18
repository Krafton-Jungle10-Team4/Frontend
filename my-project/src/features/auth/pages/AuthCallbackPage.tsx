import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

type StarStyle = {
  id: number;
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};

type ShootingStarStyle = {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
};

const generateStarStyles = (
  count: number,
  options: {
    delayMax: number;
    durationBase: number;
    durationRange: number;
    leftStart?: number;
    leftRange?: number;
  }
): StarStyle[] => {
  const { delayMax, durationBase, durationRange, leftStart = 0, leftRange = 100 } =
    options;
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${leftStart + Math.random() * leftRange}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * delayMax}s`,
    animationDuration: `${durationBase + Math.random() * durationRange}s`,
  }));
};

const generateShootingStars = (count: number): ShootingStarStyle[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${20 + Math.random() * 60}%`,
    animationDuration: `${5 + index * 2}s`,
    animationDelay: `${index * 3}s`,
  }));

/**
 * OAuth Callback 페이지
 * Google OAuth 인증 완료 후 리다이렉트되는 페이지
 *
 * 흐름:
 * 1. Google 로그인 완료
 * 2. 백엔드가 JWT 토큰을 쿼리 파라미터로 전달
 * 3. handleAuthCallback()으로 토큰 추출 및 사용자 정보 조회
 * 4. 성공 시 홈으로 이동, 실패 시 로그인 페이지로 이동
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { handleAuthCallback, error } = useAuth();
  const [smallStars] = useState(() =>
    generateStarStyles(50, { delayMax: 3, durationBase: 2, durationRange: 3 })
  );
  const [mediumStars] = useState(() =>
    generateStarStyles(30, { delayMax: 2, durationBase: 1.5, durationRange: 2 })
  );
  const [largeStars] = useState(() =>
    generateStarStyles(20, { delayMax: 2, durationBase: 1, durationRange: 2 })
  );
  const [shootingStars] = useState(() => generateShootingStars(3));

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleAuthCallback();
        // 성공 시 워크스페이스 스튜디오로 이동
        navigate(ROUTES.WORKSPACE_STUDIO, { replace: true });
      } catch (err) {
        console.error('OAuth callback failed:', err);
        // 실패 시 로그인 페이지로 이동
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    processCallback();
  }, [handleAuthCallback, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Space Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-teal-900">
        {/* Stars Layer 1 - Small stars */}
        <div className="absolute inset-0 opacity-50">
          {smallStars.map((star) => (
            <div
              key={`star1-${star.id}`}
              className="absolute w-1 h-1 bg-teal-300 rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 2 - Medium stars */}
        <div className="absolute inset-0 opacity-70">
          {mediumStars.map((star) => (
            <div
              key={`star2-${star.id}`}
              className="absolute w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 3 - Large stars */}
        <div className="absolute inset-0 opacity-80">
          {largeStars.map((star) => (
            <div
              key={`star3-${star.id}`}
              className="absolute w-2 h-2 bg-teal-500 rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                animationDuration: star.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {shootingStars.map((star) => (
            <div
              key={`shooting-${star.id}`}
              className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-0"
              style={{
                left: star.left,
                top: `-100px`,
                transform: 'rotate(135deg)',
                animation: `shooting ${star.animationDuration} linear infinite`,
                animationDelay: star.animationDelay,
              }}
            />
          ))}
        </div>

        {/* Nebula effect */}
        <div className="absolute inset-0 bg-gradient-radial from-teal-400/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-4 p-8 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20">
        {error ? (
          <>
            <div className="text-red-400 text-xl font-semibold">
              인증에 실패했습니다
            </div>
            <p className="text-teal-200">{error}</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-400 border-t-transparent" />
              <span className="text-xl font-semibold text-white">
                로그인 처리 중...
              </span>
            </div>
            <p className="text-teal-200">잠시만 기다려주세요</p>
          </>
        )}
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
