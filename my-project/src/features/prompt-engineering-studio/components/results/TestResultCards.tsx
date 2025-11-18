
/**
 * TestResultCards Component
 * 테스트 결과 카드 - 좌우 스크롤, 종합점수 표시
 */

import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { Progress } from '@shared/components/progress';
import { Award, Cpu, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { formatTestResultTitle, sortTestsByOverallScore } from '@shared/utils';
import { TestResultCardsProps } from '@features/prompt-engineering-studio/types/results';
import { siOpenai, siGooglegemini, siAnthropic } from 'simple-icons';
import { getModelColor } from '@shared/utils/styleUtils';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState, useCallback, useMemo } from 'react';

const providerDetails: Record<
  string,
  { icon: any; color: string; isSvg: boolean }
> = {
  OpenAI: { icon: siOpenai, color: '#FFFFFF', isSvg: true },
  Google: { icon: siGooglegemini, color: '#8AB4F8', isSvg: true },
  Anthropic: { icon: siAnthropic, color: '#D97706', isSvg: true },
  Unknown: { icon: Cpu, color: '#9CA3AF', isSvg: false },
};

const Icon = ({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) => {
  const details = providerDetails[provider] || providerDetails.Unknown;
  if (details.isSvg) {
    return (
      <div
        className={className}
        style={{ color: details.color }}
        dangerouslySetInnerHTML={{
          __html: details.icon.svg.replace(
            '<svg',
            `<svg fill="${details.color}"`,
          ),
        }}
      />
    );
  }
  const IconComponent = details.icon;
  return <IconComponent className={className} style={{ color: details.color }} />;
};

const getScoreColor = (score: number) => {
  if (score >= 95) return 'bg-emerald-600';
  if (score >= 90) return 'bg-sky-600';
  if (score < 85) return 'bg-rose-700';
  return 'bg-slate-500'; // 85-89.9점 구간
};

export function TestResultCards({
  testResults,
  selectedId,
  onSelectTest,
  onVisibleCardsChange,
}: TestResultCardsProps) {
  const sortedTests = useMemo(() => sortTestsByOverallScore(testResults), [testResults]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const updateVisibleSlides = useCallback(() => {
    if (!emblaApi) return;
    const visibleIndexes = emblaApi.slidesInView(true);
    const visibleIds = visibleIndexes.map(
      (index) => sortedTests[index]?.id,
    ).filter(Boolean);
    onVisibleCardsChange?.(visibleIds);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, sortedTests, onVisibleCardsChange]);

  useEffect(() => {
    if (!emblaApi) return;
    const handleUpdate = () => {
      updateVisibleSlides();
    };
    emblaApi.on('select', handleUpdate);
    emblaApi.on('reInit', handleUpdate);
    emblaApi.on('init', handleUpdate);
    return () => {
      emblaApi.off('select', handleUpdate);
      emblaApi.off('reInit', handleUpdate);
      emblaApi.off('init', handleUpdate);
    };
  }, [emblaApi, updateVisibleSlides]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {sortedTests.map((result, index) => {
            const isSelected = selectedId === result.id;
            const isWinner = index === 0;

            return (
              <div key={result.id} className="flex-[0_0_32%]">
                <Card
                  onClick={() => onSelectTest?.(result.id)}
                  className={`
                    h-full bg-black/20 backdrop-blur-md border border-white/20 p-6
                    cursor-pointer transition-all hover:bg-white/10
                    ${isWinner && !isSelected ? 'ring-2 ring-amber-500/50' : ''}
                  `}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 0 2px ${getModelColor(result.model)}`
                      : 'none',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon provider={result.provider} className="w-6 h-6" />
                      <div>
                        <h4 className="text-white mb-1">
                          {result.testSetId
                            ? formatTestResultTitle(
                                result.testSetId,
                                result.model,
                              )
                            : result.prompt}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {result.model}
                        </Badge>
                      </div>
                    </div>
                    {isWinner && <Award className="w-5 h-5 text-amber-400" />}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">종합 점수</span>
                        <span className="text-sm text-amber-400 font-semibold">
                          {result.overallScore.toFixed(1)}/100
                        </span>
                      </div>
                      <Progress
                        value={result.overallScore}
                        className="h-2.5 bg-white/10"
                        indicatorClassName={getScoreColor(result.overallScore)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">품질 점수</span>
                        <span className="text-sm text-white">
                          {result.qualityScore.toFixed(1)}/100
                        </span>
                      </div>
                      <Progress
                        value={result.qualityScore}
                        className="h-2"
                        indicatorClassName={getScoreColor(result.qualityScore)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">속도 점수</span>
                        <span className="text-sm text-white">
                          {result.speedScore}/100
                        </span>
                      </div>
                      <Progress
                        value={result.speedScore}
                        className="h-2"
                        indicatorClassName={getScoreColor(result.speedScore)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">비용 효율</span>
                        <span className="text-sm text-white">
                          {result.costScore}/100
                        </span>
                      </div>
                      <Progress
                        value={result.costScore}
                        className="h-2"
                        indicatorClassName={getScoreColor(result.costScore)}
                      />
                    </div>
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          평균 응답 시간
                        </span>
                        <span className="text-sm text-white">
                          {result.avgResponseTime}초
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          요청당 비용
                        </span>
                        <span className="text-sm text-white">
                          ${result.totalCost.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          사용자 만족도
                        </span>
                        <span className="text-sm text-white">
                          {result.userSatisfaction}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full text-white/50 hover:text-white transition-colors z-10"
        >
          <ArrowLeftCircle className="w-8 h-8" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-full text-white/50 hover:text-white transition-colors z-10"
        >
          <ArrowRightCircle className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
