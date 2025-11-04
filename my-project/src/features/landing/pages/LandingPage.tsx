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

  const handleGetStarted = () => {
    // 로그인되어 있으면 홈으로, 아니면 로그인 페이지로
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await logout();
        navigate('/landing');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    } else {
      navigate('/login');
    }
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

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-0"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `-100px`,
                transform: 'rotate(45deg)',
                animation: `shooting ${5 + i * 2}s linear infinite`,
                animationDelay: `${i * 3}s`,
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
        <header className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/5">
          <div className="flex items-center gap-2">
            <RiRobot2Line className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">BotBuilder</span>
          </div>
          <button
            onClick={handleAuthAction}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
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
                Build Intelligent
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
                  AI Chatbots
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto drop-shadow-lg">
                Create powerful AI-driven chatbots with our intuitive workflow
                builder. No coding required.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all transform hover:scale-105"
              >
                Get Started
                <RiArrowRightLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  // Scroll to features section (나중에 추가 가능)
                }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:border-white/50 transition-all"
              >
                Learn More
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-16">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Visual Workflow
                </h3>
                <p className="text-blue-200">
                  Build complex AI workflows with an intuitive drag-and-drop
                  interface
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Lightning Fast
                </h3>
                <p className="text-purple-200">
                  Deploy your chatbot instantly and start engaging with users
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-pink-200">
                  Monitor usage, costs, and performance with detailed analytics
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 text-center text-blue-200 text-sm backdrop-blur-sm bg-white/5">
          <p>&copy; 2024 BotBuilder. All rights reserved.</p>
        </footer>
      </div>

      {/* Shooting star animation keyframes - Add to global CSS */}
      <style>{`
        @keyframes shooting {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) rotate(45deg);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(100vh) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
