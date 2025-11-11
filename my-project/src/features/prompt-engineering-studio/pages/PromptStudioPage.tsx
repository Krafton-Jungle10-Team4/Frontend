import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { Input } from '@/shared/components/input';
import { toast } from 'sonner';
import { Play, Sparkles, Loader2, BookText, Plus, X } from 'lucide-react';

import {
  TemplateSelector,
  PromptEditor,
  ModelSelector,
  AdvancedSettings,
  TestQuestions,
} from '@/features/prompt-engineering-studio/components/prompt-studio';
import { SummaryBoard } from '../components/prompt-studio/SummaryBoard';
import { StudioSidebar } from '../components/layouts/StudioSidebar';

import { mockTemplates } from '@/features/prompt-engineering-studio/data/mockPrompts';
import { mockModels } from '@/features/prompt-engineering-studio/data/mockModels';
import { createTestSet, refinePersona } from '@/features/prompt-engineering-studio/api';

import type { TestQuestion } from '@/features/prompt-engineering-studio/types/prompt';

export function PromptStudioPage() {
  const navigate = useNavigate();

  // 프롬프트 스튜디오 상태
  const [testSetName, setTestSetName] = useState('');
  const [personas, setPersonas] = useState([{ id: `persona-${Date.now()}`, text: '', templateId: null as string | null }]);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([
    { id: 'question-1', value: '' },
  ]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
  const [topP, setTopP] = useState<number[]>([1.0]);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0.0);
  const [presencePenalty, setPresencePenalty] = useState<number>(0.0);
  const [stop, setStop] = useState<string>('');
  const [seed, setSeed] = useState<string>('');

  // UI 상태
  const [isRefining, setIsRefining] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [advancedSettingsEdited, setAdvancedSettingsEdited] = useState(false);

  // Context (workflow에서 넘어온 데이터)
  const [context, setContext] = useState<string>('');

  /**
   * 페이지 로드 시 데이터 처리
   */
  useEffect(() => {
    // sessionStorage에서 복원 데이터 확인
    const restoredData = sessionStorage.getItem('restoredTestSet');
    if (restoredData) {
      try {
        const data = JSON.parse(restoredData);
        restoreTestSet(data);
        sessionStorage.removeItem('restoredTestSet');
      } catch (error) {
        console.error('Failed to restore test set:', error);
      }
    }

    // URL에서 context, input 파라미터 확인 (workflow에서 넘어온 경우)
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');
    const inputParam = urlParams.get('input');

    if (contextParam) {
      setContext(contextParam);
    }
    if (inputParam) {
      setQuestions([{ id: 'question-1', value: inputParam }]);
    }
  }, []);

  const currentPersonaText = personas[currentPersonaIndex]?.text ?? '';

  const handlePersonaTextChange = useCallback((newText: string) => {
    setPersonas((currentPersonas) =>
      currentPersonas.map((persona, index) =>
        index === currentPersonaIndex ? { ...persona, text: newText, templateId: null } : persona
      )
    );
  }, [currentPersonaIndex]);

  /**
   * 페이지 로드 시 데이터 처리
   */
  useEffect(() => {
    // sessionStorage에서 복원 데이터 확인
    const restoredData = sessionStorage.getItem('restoredTestSet');
    if (restoredData) {
      try {
        const data = JSON.parse(restoredData);
        restoreTestSet(data);
        sessionStorage.removeItem('restoredTestSet');
      } catch (error) {
        console.error('Failed to restore test set:', error);
      }
    }

    // URL에서 context, input 파라미터 확인 (workflow에서 넘어온 경우)
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');
    const inputParam = urlParams.get('input');

    if (contextParam) {
      setContext(contextParam);
    }
    if (inputParam) {
      setQuestions([{ id: 'question-1', value: inputParam }]);
    }
  }, []);
  /**
   * 테스트 세트 복원
   */
  const restoreTestSet = (data: any) => {
    setTestSetName(data.testSetName || '');
    // 이전 단일 페르소나 형식 지원
    if (data.persona) {
      setPersonas([{ id: `persona-${Date.now()}`, text: data.persona, templateId: null }]);
    } else if (data.personas) {
      const loadedPersonas = data.personas.map((p: any) => ({ ...p, templateId: p.templateId || null }));
      setPersonas(loadedPersonas);
    }
    setCurrentPersonaIndex(0);
    setQuestions(
      data.testInputs?.map((input: string, index: number) => ({
        id: `question-${index + 1}`,
        value: input,
      })) || [{ id: 'question-1', value: '' }]
    );
    setSelectedModels(data.modelsTested || []);

    if (data.advancedSettings) {
      setAdvancedSettingsEdited(true);
      setTemperature([data.advancedSettings.temperature || 0.7]);
      setMaxTokens(data.advancedSettings.maxTokens);
      setTopP([data.advancedSettings.topP || 1.0]);
      setFrequencyPenalty(data.advancedSettings.frequencyPenalty || 0.0);
      setPresencePenalty(data.advancedSettings.presencePenalty || 0.0);
      setStop(data.advancedSettings.stop?.join(', ') || '');
      setSeed(data.advancedSettings.seed?.toString() || '');
    }

    toast.success('테스트 세트가 복원되었습니다.');
  };

  /**
   * 페르소나 정제
   */
  const handleRefinePersona = async () => {
    if (!currentPersonaText.trim()) {
      toast.error('페르소나를 먼저 입력해주세요.');
      return;
    }

    try {
      setIsRefining(true);
      const response = await refinePersona({ persona: currentPersonaText });
      handlePersonaTextChange(response.refinedPersona);
      toast.success('페르소나가 정제되었습니다.');
    } catch (error) {
      console.error('Failed to refine persona:', error);
      toast.error('페르소나 정제에 실패했습니다.');
    } finally {
      setIsRefining(false);
    }
  };

  /**
   * 테스트 시작
   */
  const handleStartTest = async () => {
    // 유효성 검사
    if (!testSetName.trim()) {
      toast.error('테스트 세트 이름을 입력해주세요.');
      return;
    }
    const validPersonas = personas.filter((p) => p.text.trim());
    if (validPersonas.length === 0) {
      toast.error('최소 하나의 페르소나를 입력해주세요.');
      return;
    }
    if (questions.filter((q) => q.value.trim()).length === 0) {
      toast.error('최소 하나의 테스트 질문을 입력해주세요.');
      return;
    }
    if (selectedModels.length === 0) {
      toast.error('최소 하나의 모델을 선택해주세요.');
      return;
    }

    try {
      setIsCreatingTest(true);

      const testInputs = questions
        .filter((q) => q.value.trim())
        .map((q) => q.value.trim());

      const stopArray = stop
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const advancedSettings = {
        temperature: temperature[0],
        maxTokens: maxTokens || null,
        topP: topP[0],
        frequencyPenalty,
        presencePenalty,
        stop: stopArray.length > 0 ? stopArray : undefined,
        seed: seed ? parseInt(seed, 10) : null,
      };

      const testCreationPromises = validPersonas.map((persona, index) => {
        const individualTestSetName = `${testSetName.trim()} - Persona ${
          personas.findIndex((p) => p.id === persona.id) + 1
        }`;
        return createTestSet({
          testSetName: individualTestSetName,
          persona: persona.text.trim(),
          testInputs,
          context: context || undefined,
          models: selectedModels,
          advancedSettings,
        });
      });

      const results = await Promise.all(testCreationPromises);

      toast.success(`${results.length}개의 테스트가 시작되었습니다. 결과 페이지로 이동하여 모든 결과를 확인하세요.`);

      // 결과 페이지로 이동
      if (results.length > 0) {
        const allTestSetIds = results.map(r => r.testSetId);
        navigate(`/prompt-studio/results/validation?ids=${allTestSetIds.join(',')}`);
      }
    } catch (error) {
      console.error('Failed to create test set:', error);
      toast.error('테스트 생성에 실패했습니다.');
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleAddPersona = () => {
    const newPersona = { id: `persona-${Date.now()}`, text: '', templateId: null };
    setPersonas([...personas, newPersona]);
    setCurrentPersonaIndex(personas.length);
    toast.info('새로운 페르소나가 추가되었습니다.');
  };

  const handleDeletePersona = (indexToDelete: number) => {
    if (personas.length <= 1) {
      toast.error('최소 하나의 페르소나는 유지해야 합니다.');
      return;
    }
    const newPersonas = personas.filter((_, index) => index !== indexToDelete);
    setPersonas(newPersonas);

    if (currentPersonaIndex >= indexToDelete) {
      setCurrentPersonaIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }
    
    toast.warning('페르소나가 삭제되었습니다.');
  };

  const handleSelectTemplate = (templateId: string | null) => {
    setPersonas((currentPersonas) =>
      currentPersonas.map((persona, index) => {
        if (index === currentPersonaIndex) {
          const template = templateId
            ? mockTemplates.find((t) => t.id === templateId)
            : null;
          return {
            ...persona,
            templateId: templateId,
            text: template ? template.prompt : persona.text,
          };
        }
        return persona;
      })
    );
  };


  /**
   * 모델 토글
   */
  const handleToggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleAdvancedChange = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setAdvancedSettingsEdited(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white flex items-start">
      <StudioSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="flex items-start gap-4">
              <Sparkles className="size-10 text-cyan-300 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  프롬프트 엔지니어링 스튜디오
                </h1>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl">
                  다양한 LLM 모델로 프롬프트를 테스트하고 최적의 조합을 찾아보세요. 완벽한 페르소나를 만들고, 성능을 비교하여 최고의 결과를 도출하는 AI를 구축하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* 왼쪽: 메인 설정 영역 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. 테스트 설정 (이름, 템플릿, 프롬프트) */}
              <Card className="p-6 bg-black/20 backdrop-blur-md border border-white/20">
                <h3 className="text-white text-lg mb-4">1. 테스트 설정</h3>
                <Input
                  placeholder="예: 고객 지원 챗봇 페르소나 테스트"
                  value={testSetName}
                  onChange={(e) => setTestSetName(e.target.value)}
                  className="bg-white text-black mb-6"
                />
                {/* 페르소나 탭 네비게이션 */}
                <div className="mb-4 flex items-center gap-2 flex-wrap border-b border-white/20">
                  {personas.map((persona, index) => (
                    <div
                      key={persona.id}
                      className={`flex items-center gap-1.5 py-2 px-3 cursor-pointer border-b-2 ${
                        currentPersonaIndex === index
                          ? 'border-teal-400 text-teal-300'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                      onClick={() => setCurrentPersonaIndex(index)}
                    >
                      <span className="text-sm">프롬프트 {index + 1}</span>
                      {personas.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePersona(index);
                          }}
                          className="text-white/50 hover:text-white"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddPersona}
                    className="ml-2 text-white/60 hover:text-white"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <PromptEditor
                  selectedTemplate={personas[currentPersonaIndex]?.templateId ?? null}
                  templates={mockTemplates}
                  promptText={currentPersonaText}
                  onPromptTextChange={handlePersonaTextChange}
                  onRefine={handleRefinePersona}
                  isRefining={isRefining}
                  refineDisabled={!currentPersonaText.trim()}
                  onSelectTemplate={handleSelectTemplate}
                />
              </Card>

              {/* 2. 테스트 대상 (질문, 모델) */}
              <Card className="p-6 bg-black/20 backdrop-blur-md border border-white/20">
                <h3 className="text-white text-lg mb-4">2. 테스트 대상</h3>
                {/* 테스트 질문 */}
                <TestQuestions
                  questions={questions}
                  onQuestionsChange={setQuestions}
                />
                <div className="my-6 border-t border-white/10" />
                {/* 모델 선택 */}
                <ModelSelector
                  models={mockModels}
                  selectedModels={selectedModels}
                  onToggleModel={handleToggleModel}
                />
              </Card>

              {/* 3. 고급 설정 */}
              <AdvancedSettings
                isOpen={isAdvancedOpen}
                onOpenChange={setIsAdvancedOpen}
                temperature={temperature}
                onTemperatureChange={handleAdvancedChange(setTemperature)}
                topP={topP}
                onTopPChange={handleAdvancedChange(setTopP)}
                maxTokens={maxTokens}
                onMaxTokensChange={handleAdvancedChange(setMaxTokens)}
                stopSequences={stop}
                onStopSequencesChange={handleAdvancedChange(setStop)}
              />

              {/* 테스트 시작 버튼 */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  disabled={isCreatingTest}
                  className="min-w-[200px] bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all transform hover:scale-105"
                >
                  {isCreatingTest ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      테스트 생성 중...
                    </>
                  ) : (
                    <>
                      <Play className="size-5 mr-2" />
                      테스트 시작
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 오른쪽: 요약 보드 */}
            <div className="lg:col-span-1 sticky top-8">
              <SummaryBoard
                testSetName={testSetName}
                personas={personas}
                questions={questions}
                selectedModels={selectedModels}
                models={mockModels}
                temperature={temperature[0]}
                maxTokens={maxTokens}
                topP={topP[0]}
                stopSequences={stop}
                advancedSettingsEdited={advancedSettingsEdited}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
