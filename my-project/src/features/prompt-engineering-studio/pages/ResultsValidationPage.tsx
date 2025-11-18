/**
 * Results Validation Page
 * 결과 & 검증 - 페르소나 선택 보드 적용
 */
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { Download, Copy, Loader2, Check, ClipboardCheck, ChevronRight } from 'lucide-react';
import { useTestResults } from '@features/prompt-engineering-studio/hooks/useTestResults';
import {
      WinnerCard,
      TestResultCards,
      DetailedAnalysisTabs,
      SelectedTestCard,
      PersonaSelector,
    } from '@features/prompt-engineering-studio/components/results';
    import { StudioSidebar } from '../components/layouts/StudioSidebar';
    import { Card } from '@shared/components/card';
    import { getModelColor } from '@shared/utils/styleUtils';
    import { resultsApi } from '../api/resultsApi';
    
    interface PersonaSummary {
      id: string;
      name: string;
      text: string;
    }
    
    export function ResultsValidationPage() {
      const [searchParams] = useSearchParams();
      const testSetIds = useMemo(
        () => searchParams.get('ids')?.split(',') || [],
        [searchParams]
      );
    
      const [currentTestSetId, setCurrentTestSetId] = useState<string | null>(
        testSetIds[0] || null
      );
      const { testResults, winner } = useTestResults(
        currentTestSetId ?? undefined
      );
    
      const [selectedId, setSelectedId] = useState<string | null>(null);
      const [visibleModelIds, setVisibleModelIds] = useState<string[]>([]);
      const [personaSummaries, setPersonaSummaries] = useState<PersonaSummary[]>(
        []
      );
      const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
    
      useEffect(() => {
        const fetchPersonaSummaries = async () => {
          if (testSetIds.length === 0) {
            setIsLoadingPersonas(false);
            return;
          }
          try {
            setIsLoadingPersonas(true);
            const summaries = await Promise.all(
              testSetIds.map(async (id, index) => {
                const results = await resultsApi.getTestResults(id);
                return {
                  id,
                  name: `페르소나 ${index + 1}`,
                  text:
                    results[0]?.persona || '페르소나 정보를 불러올 수 없습니다.',
                };
              })
            );
            setPersonaSummaries(summaries);
          } catch (error) {
            console.error('페르소나 요약 정보를 불러오는데 실패했습니다:', error);
          } finally {
            setIsLoadingPersonas(false);
          }
        };
        fetchPersonaSummaries();
      }, [testSetIds]);
    
      useEffect(() => {
        if (testResults.length > 0) {
          setSelectedId(testResults[0].id);
        }
      }, [testResults]);
    
      const selectedTest = testResults.find((test) => test.id === selectedId);
    
      if (isLoadingPersonas || (currentTestSetId && testResults.length === 0)) {
        return (
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <Loader2 className="w-8 h-8 mr-2 animate-spin" />
            <span className="text-xl">
              {isLoadingPersonas
                ? '결과를 불러오는 중...'
                : '결과를 불러오는 중...'}
            </span>
          </div>
        );
      }
    
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white flex items-start">
          <StudioSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                {/* Breadcrumb Navigation */}
                <div className="mb-4 flex items-center text-sm text-gray-400">
                  <Link to="/prompt-studio" className="hover:text-white">프롬프트 스튜디오</Link>
                  <ChevronRight className="mx-2 size-4" />
                  <span className="font-semibold text-white">결과 & 검증</span>
                </div>
      
                {/* Main Title Area */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <ClipboardCheck className="size-10 text-cyan-300 flex-shrink-0 mt-1" />
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        결과 & 검증
                      </h1>
                      <p className="mt-2 text-lg text-gray-400 max-w-2xl">
                        A/B 테스트 결과 분석 및 품질 평가
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                    {personaSummaries.length > 0 && (
                      <div>
                        <PersonaSelector
                          personas={personaSummaries}
                          selectedPersonaId={currentTestSetId}
                          onSelectPersona={setCurrentTestSetId}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
    
              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <TestResultCards
                    testResults={testResults}
                    selectedId={selectedId}
                    onSelectTest={setSelectedId}
                    onVisibleCardsChange={setVisibleModelIds}
                  />
                  <DetailedAnalysisTabs
                    allTests={testResults}
                    selectedTest={selectedTest}
                    visibleModelIds={visibleModelIds}
                  />
                </div>
    
                {/* Summary & Actions */}
                <div className="lg:col-span-1 space-y-6 sticky top-8">
                  <WinnerCard winner={winner} />
                  <SelectedTestCard selectedTest={selectedTest} />
    
                  {/* Action Buttons Card */}
                  <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-4 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 bg-black/20 hover:bg-white/10 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      결과 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white/20 bg-black/20 hover:bg-white/10 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      결과 복사
                    </Button>
                    <Button
                      className="w-full text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => alert('배포 기능 연결 필요')}
                      disabled={!selectedTest}
                      style={
                        selectedTest
                          ? {
                              backgroundColor: getModelColor(selectedTest.model),
                              boxShadow: `0 4px 14px 0 ${getModelColor(
                                selectedTest.model
                              )}70`,
                            }
                          : {}
                      }
                    >
                      이 조합 사용하기
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
