import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import pipelineImg from '../assets/pipeline.png';
import '../newLanding.css';

import { useAuth } from '@/features/auth';
import { Logo } from '@/shared/components/Logo';

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

const NetworkMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: NodePoint[] = [];
    const NODE_COUNT = 36;
    const CONNECTION_DISTANCE = 220;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 2.5 + Math.random() * 2.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.14;
            ctx.strokeStyle = `rgba(55, 53, 195, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.clientWidth) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.clientHeight) node.vy *= -1;

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 16);
        gradient.addColorStop(0, 'rgba(55,53,195,0.35)');
        gradient.addColorStop(1, 'rgba(55,53,195,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mesh" />;
};

const EdgeAnimator = () => {
  useEffect(() => {
    const lines = Array.from(document.querySelectorAll<SVGPathElement>('.edge-line'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('drawn');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    lines.forEach((line) => observer.observe(line));

    return () => observer.disconnect();
  }, []);

  return null;
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="metric">
    <div className="metric-value">{value}</div>
    <div className="metric-label">{label}</div>
  </div>
);

function MicroStack() {
  return (
    <div className="micro-stack">
      <div className="micro-row">
        <span className="chip">RAG</span>
        <span className="bar" />
        <span className="chip">Search</span>
      </div>
      <div className="micro-row">
        <span className="chip">Guardrail</span>
        <span className="bar alt" />
        <span className="dot" />
      </div>
      <div className="micro-footer">Latency 42ms · Drift 0.3%</div>
    </div>
  );
}

function StatusBadge() {
  return (
    <div className="status-card">
      <div className="status-pill">Status: Live</div>
      <div className="status-line">
        <span className="spark" />
        prod-edge · autoscale on
      </div>
      <div className="status-line muted">release #94af · 테스트 128/128 통과</div>
    </div>
  );
}

function MiniGraph() {
  return (
    <div className="mini-graph">
      {[72, 88, 96, 104, 98, 110].map((v, i) => (
        <div key={v + i} className="mini-bar" style={{ height: `${v}%` }} />
      ))}
      <div className="graph-line" />
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const showcaseRef = useRef<HTMLElement | null>(null);

  const handleStartFree = () => {
    if (isAuthenticated) {
      navigate('/workspace/studio');
    } else {
      navigate('/login');
    }
  };

  const handleScrollToShowcase = () => {
    showcaseRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="landing-page">
      <div className="page">
        <EdgeAnimator />
        <div className="hero-aurora aurora-one" />
        <div className="hero-aurora aurora-two" />

        <header className="top-nav">
          <button className="brand-mark" onClick={() => navigate('/landing')} type="button">
            <div className="brand-logo-wrapper text-indigo-500">
              <Logo className="h-8 w-8" />
            </div>
            <div className="brand-name">SnapAgent</div>
          </button>
          <div className="nav-actions">
            {!isAuthenticated ? (
              <button className="ghost-btn" onClick={handleAuthAction} disabled={isLoading}>
                로그인
              </button>
            ) : (
              <button className="cta-btn" onClick={handleAuthAction} disabled={isLoading}>
                로그아웃
              </button>
            )}
          </div>
        </header>

        <main>
          <section className="section hero">
            <div className="hero-copy">
              <div className="eyebrow">Solid Intelligence · Architectural Beauty</div>
              <h1>
                상상하던 AI 에이전트,
                <br />
                파이프라인으로 현실이 됩니다.
              </h1>
              <p>
                시각적 노드 에디터, 자동 테스트, 원클릭 배포까지 하나로 묶은 엔터프라이즈급 SaaS.
                <br />
                각 워크플로우는 안전하게 버전 관리되고, 실시간 모니터링으로 품질을 지켜냅니다.
              </p>
              <div className="cta-row">
                <button className="cta-btn" onClick={handleStartFree} disabled={isLoading}>
                  무료로 시작하기 (Start Free)
                </button>
                <button className="ghost-btn subtle" onClick={handleScrollToShowcase}>
                  제품 구조 살펴보기
                </button>
              </div>
              <div className="metrics">
                <Metric label="실시간 처리" value="1.2M req/day" />
                <Metric label="SLO" value="99.95%" />
                <Metric label="팀 협업" value="PM · Eng · Ops" />
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-surface">
                <NetworkMesh />
                <div className="floating-card big">
                  <div className="card-head">
                    <span className="pill">Pipeline Preview</span>
                    <span className="dot" />
                  </div>
                  <div className="card-body">
                    <div className="node-track">
                      <span className="node">In</span>
                      <span className="edge" />
                      <span className="node alt">LLM</span>
                      <span className="edge alt" />
                      <span className="node">Out</span>
                    </div>
                    <MicroStack />
                  </div>
                </div>
                <div className="floating-card small">
                  <div className="card-head">
                    <span className="pill alt">Spend Monitor</span>
                    <span className="spark" />
                  </div>
                  <div className="card-body tiny">
                    <div className="tiny-row">토큰 사용량 실시간 확인</div>
                    <div className="progress">
                      <span style={{ width: '68%' }} />
                    </div>
                    <div className="tiny-row muted">예산 한도 82% 여유</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section showcase" id="showcase" ref={showcaseRef}>
            <div className="section-head">
              <p className="eyebrow">Product Showcase</p>
              <h2>시각적 파이프라인, 그대로 프로덕션에 띄우세요.</h2>
              <p className="section-desc">
                SnapShot 워크플로우 이미지를 그대로 임베드한 프로덕트 프레임. 빛을 머금은 유리 테두리와 추상 노드 장식이 엔터프라이즈 감성을 더합니다.
              </p>
            </div>

            <div className="showcase-frame border-shimmer">
              <div className="frame-glow" />
              <div className="frame-header">
                <div className="grain" />
                <div className="breadcrumbs">snapagent.app / pipelines / builder</div>
                <div className="status-dot" />
              </div>
              <div className="frame-body">
                <img src={pipelineImg} alt="SnapAgent Workflow" className="pipeline" />
                <svg className="edge-overlay" viewBox="0 0 1200 640" preserveAspectRatio="none">
                  <path
                    className="edge-line"
                    d="M80 420 C260 380 420 320 600 360 C760 396 900 500 1120 460"
                  />
                  <path
                    className="edge-line"
                    d="M160 160 C340 240 520 200 720 240 C880 272 1020 240 1140 200"
                  />
                  <path
                    className="edge-line"
                    d="M220 520 C380 480 520 440 720 520 C880 584 960 600 1120 560"
                  />
                </svg>
                <div className="floating-node node-a" />
                <div className="floating-node node-b" />
                <div className="floating-node node-c" />
              </div>
            </div>
          </section>

          <section className="section features" id="features">
            <div className="section-head inline">
              <p className="eyebrow">Key Features</p>
              <h2>하나의 비주얼 화면에서 설계 · 테스트 · 배포</h2>
            </div>

            <div className="bento-grid">
              <div className="feature-card large">
                <div className="aurora" />
                <div className="feature-title">Visual Node Editor</div>
                <p className="feature-desc">직관적인 드래그 앤 드롭.</p>
                <div className="feature-visual sphere">
                  <div className="glass-sphere" />
                  <div className="micro-caption">노드 연동 상태 자동 저장</div>
                </div>
                <div className="feature-meta">
                  start → knowledge-retrieval → template-transform → llm → answer
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Instant Deploy</div>
                <p className="feature-desc">버튼 클릭 한 번으로 서버 생성.</p>
                <StatusBadge />
              </div>

              <div className="feature-card">
                <div className="feature-title">Real-time Monitoring</div>
                <p className="feature-desc">토큰 사용량 실시간 확인.</p>
                <MiniGraph />
              </div>
            </div>
          </section>

          <section className="section process" id="process">
            <div className="section-head inline">
              <div>
                <p className="eyebrow">Process</p>
                <h2>단 3단계로 완성</h2>
                <p className="section-desc">
                  복잡한 개발 과정은 잊으세요. 간단한 3단계로 AI 에이전트를 만들 수 있습니다.
                </p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-card">
                <div className="micro-visual connect">
                  <div className="node-point" />
                  <div className="node-point alt" />
                  <div className="node-bridge">
                    <span />
                  </div>
                  <div className="node-tail" />
                </div>
                <div className="step-title">
                  01 Connect
                  <br />
                  블록처럼 연결하세요
                </div>
                <p className="step-desc">노드를 드래그 앤 드롭으로 연결하면 복잡한 대화 흐름이 완성됩니다.</p>
              </div>
              <div className="step-card">
                <div className="micro-visual chat">
                  <div className="chat-window">
                    <div className="chat-bubble">안녕하세요! 테스트 메시지</div>
                    <div className="chat-bubble alt">실시간 응답이 준비됐어요.</div>
                    <div className="chat-input">
                      <div className="pulse-dot" />
                      <span>테스트 실행 중...</span>
                    </div>
                  </div>
                </div>
                <div className="step-title">
                  02 Test
                  <br />
                  실시간으로 테스트하세요
                </div>
                <p className="step-desc">변경사항을 즉시 프리뷰하고, 자동 테스트로 성능을 검증하세요.</p>
              </div>
              <div className="step-card">
                <div className="micro-visual launch">
                  <div className="toggle-track">
                    <div className="toggle-thumb">
                      <span className="glint" />
                    </div>
                    <div className="toggle-label">LIVE</div>
                  </div>
                  <div className="deploy-pill">Deploy · ON</div>
                </div>
                <div className="step-title">
                  03 Launch
                  <br />
                  클릭 한 번으로 배포하세요
                </div>
                <p className="step-desc">버튼 하나로 AI 에이전트가 실제 서비스로 배포됩니다.</p>
              </div>
            </div>
          </section>

          <section className="section benefits" id="benefits">
            <div className="section-head">
              <p className="eyebrow">Why SnapShot</p>
              <h2>왜 SnapShot인가요?</h2>
              <p className="section-desc">
                기업 데이터와 AI를 연결하는 가장 빠르고 안정적인 방법을 제공합니다.
              </p>
            </div>
            <div className="benefit-grid">
              <div className="benefit-card">
                <div className="benefit-visual cursors">
                  <span className="cursor-shape" />
                  <span className="cursor-shape alt" />
                </div>
                <div className="benefit-title">팀 생산성 극대화</div>
                <p className="benefit-desc">하나의 UI에서 기획자, 개발자가 협업합니다.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-visual graph">
                  <div className="mini-bar tall" />
                  <div className="mini-bar" />
                  <div className="mini-bar taller" />
                  <div className="mini-bar tall" />
                </div>
                <div className="benefit-title">실험 비용 제로</div>
                <p className="benefit-desc">자동 테스트와 실시간 프리뷰로 빠르게 반복 실험하세요.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-visual globe">
                  <div className="glass-doc" />
                  <div className="glass-globe" />
                </div>
                <div className="benefit-title">최신 정보 + 내부 지식</div>
                <p className="benefit-desc">웹 검색과 RAG를 하이브리드로 사용하세요.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-visual badge">
                  <div className="status-pill">Status: Live</div>
                  <div className="status-dot-small" />
                </div>
                <div className="benefit-title">코드 없이 즉시 배포</div>
                <p className="benefit-desc">클릭 한 번으로 FastAPI 서버가 생성됩니다.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-visual plugs">
                  <div className="plug-line">
                    <span className="plug" />
                    <span className="plug alt" />
                    <span className="plug" />
                  </div>
                  <div className="plug-hub" />
                </div>
                <div className="benefit-title">무한 확장성</div>
                <p className="benefit-desc">MCP로 외부 시스템과 DB를 자유롭게 연결하세요.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-visual shield">
                  <div className="glass-shield">
                    <div className="shield-core" />
                  </div>
                </div>
                <div className="benefit-title">안전한 운영</div>
                <p className="benefit-desc">JWT 인증, 접근 제어 등 프로덕션 보안을 제공합니다.</p>
              </div>
            </div>
          </section>

          <section className="section use-cases" id="cases">
            <div className="section-head inline">
              <p className="eyebrow">Use Cases</p>
              <h2>무엇이든 만들 수 있습니다.</h2>
            </div>
            <div className="case-grid">
              <div className="case-card">
                <div className="case-number">01</div>
                <div>
                  <div className="case-title">사내 FAQ / 가이드 챗봇</div>
                  <p className="case-desc">문서를 업로드하면 RAG로 학습, 24시간 응답하는 내부 지식 도우미.</p>
                </div>
              </div>
              <div className="case-card">
                <div className="case-number">02</div>
                <div>
                  <div className="case-title">웹+내부 하이브리드 Q&A</div>
                  <p className="case-desc">Tavily 검색과 지식 베이스를 결합해 최신 정책·뉴스까지 놓치지 않습니다.</p>
                </div>
              </div>
              <div className="case-card">
                <div className="case-number">03</div>
                <div>
                  <div className="case-title">콘텐츠 톤 정제 파이프라인</div>
                  <p className="case-desc">
                    초안 생성 → 한국어 톤 정제 → SEO 최적화까지 자동화된 생성 파이프라인.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section final">
            <div className="final-inner">
              <div>
                <p className="eyebrow light">Ready to build</p>
                <h2>지금 바로 시작하세요</h2>
                <p className="section-desc light">
                  신용카드 없이 바로 실험하고, 팀이 합류하면 즉시 확장하세요. © 2025 SnapAgent.
                </p>
              </div>
              <div className="cta-row">
                <button className="cta-btn strong" onClick={handleStartFree} disabled={isLoading}>
                  Start Free
                </button>
                <button className="ghost-btn dark">엔터프라이즈 상담</button>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="brand-name">SnapAgent</div>
          <div className="footer-links">
            <a>제품</a>
            <a>보안</a>
            <a>문서</a>
            <a>지원</a>
          </div>
          <span className="footer-copy">© 2025 SnapAgent</span>
        </footer>
      </div>
    </div>
  );
}
