import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiRobot2Line,
  RiArrowRightLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiFlowChart,
  RiSparklingLine,
  RiTestTubeLine,
  RiRocketLine,
  RiDatabase2Line,
  RiCodeSSlashLine,
} from '@remixicon/react';
import { useAuth } from '@/features/auth';

/**
 * LandingPage - 메인 랜딩 페이지
 * 깔끔한 화이트 배경의 모던한 디자인
 */
export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;
      section.classList.add('section-reveal');
      if (index === 0) {
        section.classList.add('section-reveal-visible');
        return;
      }
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/workspace/studio');
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

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-100">
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full px-6 lg:px-12 py-6 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <RiRobot2Line className="h-9 w-9 text-teal-500" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              SnapAgent
            </span>
          </div>
          <button
            onClick={handleAuthAction}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-medium transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isAuthenticated ? (
              <RiLogoutCircleLine className="h-5 w-5" />
            ) : (
              <RiLoginCircleLine className="h-5 w-5" />
            )}
            <span className="font-medium text-sm">
              {isAuthenticated ? '로그아웃' : '로그인'}
            </span>
          </button>
        </header>

        {/* Hero Section */}
        <section
          className="px-6 lg:px-12 pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gray-100 border-b border-gray-200"
          ref={(el) => (sectionRefs.current[0] = el)}
        >
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                차세대 AI Agent
                <br />
                <span className="relative inline-block mt-2 text-gray-800">
                  개발 플랫폼
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                시각적 Workflow Builder와 고급 Prompt Engineering으로
                <br className="hidden md:block" />
                누구나 쉽게 강력한 AI Agent를 만들 수 있습니다
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold text-base shadow-lg shadow-gray-500/40 transition-all hover:bg-gray-800 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
              >
                <span className="flex items-center gap-2">
                  무료로 시작하기
                  <RiArrowRightLine className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={scrollToFeatures}
                className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold text-base border border-gray-900 transition-all hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
              >
                더 알아보기
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-gray-800">100+</div>
                <div className="text-sm text-gray-500">활성 사용자</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-gray-800">99.9%</div>
                <div className="text-sm text-gray-500">안정성</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-gray-800">24/7</div>
                <div className="text-sm text-gray-500">운영 시간</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="px-6 lg:px-12 py-24 bg-gray-200 border-y border-gray-300"
          ref={(el) => (sectionRefs.current[1] = el)}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                모든 기능을 하나로
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                AI Agent 개발에 필요한 모든 도구를 통합 플랫폼에서 제공합니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/30">
                  <RiFlowChart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  시각적 Workflow Builder
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  드래그 앤 드롭으로 복잡한 AI 로직을 직관적으로 구성하고, 실시간으로 테스트할 수 있습니다
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                  <RiSparklingLine className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Prompt Engineering Studio
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  고급 프롬프트 최적화 도구로 AI 응답 품질을 극대화하고 일관성을 보장합니다
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
                  <RiTestTubeLine className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  자동화된 테스트
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  대규모 테스트셋으로 Agent 성능을 검증하고, 개선 지점을 자동으로 파악합니다
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/30">
                  <RiRocketLine className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  원클릭 배포
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  개발 완료 즉시 프로덕션 환경에 배포하고, 사용자에게 즉시 서비스를 제공합니다
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                  <RiDatabase2Line className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  지식 베이스 통합
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  문서를 업로드하고 RAG 기술로 Agent에게 전문 지식을 학습시킬 수 있습니다
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
                  <RiCodeSSlashLine className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  MCP 프로토콜 지원
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Model Context Protocol로 외부 시스템과 안전하게 연동하고 기능을 확장합니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          className="px-6 lg:px-12 py-24 bg-gray-100 border-y border-gray-200"
          ref={(el) => (sectionRefs.current[2] = el)}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                간단한 3단계
              </h2>
              <p className="text-lg text-gray-600">
                누구나 쉽게 AI Agent를 만들고 배포할 수 있습니다
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/30">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Workflow 설계</h3>
                  <p className="text-gray-600">
                    비주얼 빌더로 대화 흐름과 로직을 직관적으로 구성합니다
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-300 to-transparent" />
              </div>

              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">테스트 & 최적화</h3>
                  <p className="text-gray-600">
                    실시간 프리뷰와 자동 테스트로 Agent 성능을 검증합니다
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-300 to-transparent" />
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-pink-500/30">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">즉시 배포</h3>
                <p className="text-gray-600">
                  원클릭으로 프로덕션에 배포하고 사용자와 연결됩니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section
          className="px-6 lg:px-12 py-32 bg-gray-200 border-y border-gray-300"
          ref={(el) => (sectionRefs.current[3] = el)}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-gray-600">
                무료로 AI Agent를 만들고, 무한한 가능성을 경험하세요
              </p>
            </div>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white rounded-lg font-semibold text-lg shadow-2xl shadow-gray-600/40 transition-all hover:bg-gray-800 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
            >
              <span className="flex items-center gap-2">
                무료로 시작하기
                <RiArrowRightLine className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-8 border-t border-gray-200 bg-gray-100">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>&copy; 2025 SnapAgent. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .section-reveal {
          opacity: 0;
          transform: translateY(60px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .section-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .section-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
