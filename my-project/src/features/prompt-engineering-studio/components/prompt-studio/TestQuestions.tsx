import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Plus, X, HelpCircle } from 'lucide-react';
import { TestQuestion } from '@/features/prompt-engineering-studio/types/prompt';

interface TestQuestionsProps {
  questions: TestQuestion[];
  onQuestionsChange: (questions: TestQuestion[]) => void;
}

export function TestQuestions({ questions, onQuestionsChange }: TestQuestionsProps) {
  const handleAddQuestion = () => {
    const newQuestion: TestQuestion = {
      id: `question-${Date.now()}`,
      value: '',
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length > 1) {
      onQuestionsChange(questions.filter((q) => q.id !== questionId));
    }
  };

  const handleQuestionChange = (questionId: string, value: string) => {
    onQuestionsChange(
      questions.map((q) => (q.id === questionId ? { ...q, value } : q))
    );
  };

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-violet-400" />
          <h3 className="text-white text-lg">테스트 질문</h3>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleAddQuestion}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          질문 추가
        </Button>
      </div>

      <div className="space-y-2">
        {questions.map((question, index) => (
          <div key={question.id} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-white/60">질문 {index + 1}</label>
              <Input
                placeholder={`테스트 질문 ${index + 1}을 입력하세요...`}
                value={question.value}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/40"
              />
            </div>
            {questions.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="!text-white/60 hover:!text-red-400 mt-5"
                onClick={() => handleRemoveQuestion(question.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}