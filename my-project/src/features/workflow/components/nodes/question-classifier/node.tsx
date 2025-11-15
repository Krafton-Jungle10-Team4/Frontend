import type { NodeProps, QuestionClassifierNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Question Classifier 노드
 * AI 기반 질문 분류
 */
const QuestionClassifierNode = ({ data }: NodeProps<QuestionClassifierNodeType>) => {
  // 안전한 데이터 접근
  const model = data?.model;
  const classes = data?.classes ?? [];
  const visionEnabled = data?.vision?.enabled ?? false;

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 모델 정보 */}
      <div className="space-y-1">
        <div className="system-2xs-regular-uppercase text-text-tertiary">MODEL</div>
        <div className="system-xs-medium text-text-primary">
          {model ? (
            <>
              {model.provider}/{model.name}
              {visionEnabled && (
                <span className="ml-1.5 text-xs text-purple-600">(Vision)</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">모델 미설정</span>
          )}
        </div>
      </div>

      {/* 클래스 목록 */}
      <div className="space-y-1">
        <div className="system-2xs-regular-uppercase text-text-tertiary">CLASSES</div>
        {classes.length === 0 ? (
          <div className="text-xs text-gray-400 italic">클래스 없음</div>
        ) : (
          <div className="space-y-1">
            {classes.map((topic, idx) => (
              <div
                key={topic.id}
                className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5"
              >
                <div className="system-xs-medium text-text-primary">
                  {topic.name || `Class ${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(QuestionClassifierNode);
