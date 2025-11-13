import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiRobot2Line,
  RiArrowRightLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
} from '@remixicon/react';
import { useAuth } from '@/features/auth';

/**
 * LandingPage - 메인 랜딩 페이지
 * 로그인하지 않은 사용자가 처음 접근하는 페이지
 */
export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();

  // Memoize star positions to avoid recalculating on every render
  const stars1 = useMemo(
    () =>
      [...Array(50)].map((_, i) => ({
        id: `star1-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3,
      })),
    []
  );

  const stars2 = useMemo(
    () =>
      [...Array(30)].map((_, i) => ({
        id: `star2-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 1.5 + Math.random() * 2,
      })),
    []
  );

  const stars3 = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        id: `star3-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 1 + Math.random() * 2,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      [...Array(3)].map((_, i) => ({
        id: `shooting-${i}`,
        left: 20 + Math.random() * 60,
        animationDuration: 5 + i * 2,
        animationDelay: i * 3,
      })),
    []
  );

  const handleGetStarted = () => {
    // 로그인되어 있으면 홈으로, 아니면 로그인 페이지로
    if (isAuthenticated) {
      navigate('/home');
    }
    else {
      navigate('/login');
    }
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await logout();
        navigate('/landing');
      }
      catch (error) {
        console.error('Logout failed:', error);
      }
    }
    else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Space Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-teal-900">
        {/* Stars Layer 1 - Small stars */}
        <div className="absolute inset-0 opacity-50">
          {stars1.map((star) => (
            <div
              key={star.id}
              className="absolute w-1 h-1 bg-teal-300 rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 2 - Medium stars */}
        <div className="absolute inset-0 opacity-70">
          {stars2.map((star) => (
            <div
              key={star.id}
              className="absolute w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
              }}
            />
          ))}
        </div>

        {/* Stars Layer 3 - Large stars */}
        <div className="absolute inset-0 opacity-80">
          {stars3.map((star) => (
            <div
              key={star.id}
              className="absolute w-2 h-2 bg-teal-500 rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {shootingStars.map((star) => (
            <div
              key={star.id}
              className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-0"
              style={{
                left: `${star.left}%`,
                top: `-100px`,
                transform: 'rotate(135deg)',
                animation: `shooting ${star.animationDuration}s linear infinite`,
                animationDelay: `${star.animationDelay}s`,
              }}
            />
          ))}
        </div>

        {/* Nebula effect */}
        <div className="absolute inset-0 bg-gradient-radial from-teal-400/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-black/20">
          <div className="flex items-center gap-2">
            <RiRobot2Line className="h-8 w-8 text-teal-400" />
            <span className="text-2xl font-bold text-white">SnapAgent</span>
          </div>
          <button
            onClick={handleAuthAction}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAuthenticated ? (
              <RiLogoutCircleLine className="h-5 w-5" />
            ) : (
              <RiLoginCircleLine className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isAuthenticated ? '로그아웃' : '로그인'}
            </span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                지능형 AI Agent를
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 animate-pulse">
                  만들어보세요
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto drop-shadow-lg">
                직관적인 Workflow Builder로 강력한 Agent을 제작하세요.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all transform hover:scale-105"
              >
                시작하기
                <RiArrowRightLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  // Scroll to features section (나중에 추가 가능)
                }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold text-lg  │
│        border-2 border-white/30 hover:border-white/50 transition-all"
              >
                더 알아보기
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-16">
              <div className="p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-black/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  시각적 Workflow
                </h3>
                <p className="text-gray-400">
                  직관적인 드래그 앤 드롭 인터페이스로 복잡한 AI Workflow를 손쉽게 
                  구축하세요
                </p>
              </div>

              <div className="p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-black/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  빠른 배포
                </h3>
                <p className="text-gray-400">
                  Agent를 즉시 배포하고 사용자와 소통을 시작하세요
                </p>
              </div>

              <div className="p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-black/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  실시간 분석
                </h3>
                <p className="text-gray-400">
                  상세한 분석으로 사용량, 비용 및 성능을 모니터링하세요
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 text-center text-teal-200 text-sm backdrop-blur-sm bg-black/20">
          <p>&copy; 2025 SnapAgent. All rights reserved.</p>
        </footer>
      </div>

      {/* Shooting star animation keyframes - Add to global CSS */}
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
}
