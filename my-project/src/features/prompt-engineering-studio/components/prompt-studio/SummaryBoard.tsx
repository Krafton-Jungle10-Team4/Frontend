/**
 * SummaryBoard Component
 * 현재 선택된 테스트 설정을 요약하여 보여주는 보드
 */
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import type { ModelConfig, TestQuestion } from '../../types';
import { getModelColor } from '@shared/utils/styleUtils';

interface SummaryBoardProps {
  testSetName: string;
  personas: { id: string; text: string }[];
  questions: TestQuestion[];
  selectedModels: string[];
  models: ModelConfig[];
  temperature: number;
  maxTokens: number | undefined;
  topP: number;
  stopSequences: string;
  advancedSettingsEdited: boolean;
}

export function SummaryBoard({
  testSetName,
  personas,
  questions,
  selectedModels,
  models,
  temperature,
  maxTokens,
  topP,
  stopSequences,
  advancedSettingsEdited,
}: SummaryBoardProps) {
  const getModelName = (id: string) => models.find(m => m.id === id)?.name || id;

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h3 className="text-white mb-4 text-lg">테스트 요약</h3>
      <div className="space-y-5 pr-4">
          {/* 테스트 세트 이름 */}
          <div>
            <h4 className="text-sm text-white/60 mb-1">테스트 이름</h4>
            <p className="text-white break-words">{testSetName || '이름 미설정'}</p>
          </div>

          {/* 페르소나 (프롬프트) */}
          <div>
            <h4 className="text-sm text-white/60 mb-1">프롬프트</h4>
            <div className="space-y-2">
              {personas.map((persona, index) => (
                <div key={persona.id}>
                  <p className="text-xs text-white/70 mb-1">페르소나 {index + 1}</p>
                  <p className="text-white text-sm bg-white/5 p-3 rounded-md max-h-28 overflow-y-auto break-words">
                    {persona.text || '내용 없음'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 테스트 질문 */}
          <div>
            <h4 className="text-sm text-white/60 mb-1">테스트 질문</h4>
            <ul className="space-y-1 list-disc list-inside text-white text-sm">
              {questions
                .filter(q => q.value.trim())
                .map((q) => <li key={q.id}>{q.value}</li>)
              }
              {questions.filter(q => q.value.trim()).length === 0 && <li>질문 없음</li>}
            </ul>
          </div>

          {/* 선택된 모델 */}
          <div>
            <h4 className="text-sm text-white/60 mb-1">선택된 모델</h4>
            <div className="flex flex-wrap gap-2">
              {selectedModels.length > 0 ? (
                selectedModels.map(id => {
                  const modelName = getModelName(id);
                  return (
                    <Badge 
                      key={id} 
                      variant="default" 
                      style={{ backgroundColor: getModelColor(modelName), color: 'white' }}
                    >
                      {modelName}
                    </Badge>
                  )
                })
              ) : (
                <p className="text-sm text-white/80">모델 선택 안함</p>
              )}
            </div>
          </div>

          {/* 고급 설정 (수정되었을 때만 표시) */}
          {advancedSettingsEdited && (
            <div>
              <h4 className="text-sm text-white/60 mb-1">주요 고급 설정</h4>
              <div className="text-sm text-white space-y-1">
                <p>창의성 (Temp): <span className="font-mono">{temperature.toFixed(1)}</span></p>
                <p>최대 답변 길이: <span className="font-mono">{maxTokens || '자동'}</span></p>
                <p>Top P: <span className="font-mono">{topP.toFixed(1)}</span></p>
                <p>중단 단어: <span className="font-mono">{stopSequences || '없음'}</span></p>
              </div>
            </div>
          )}
        </div>
    </Card>
  );
}
