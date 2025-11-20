import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { X } from 'lucide-react';
import { useDemoAppStore } from '../stores/demoAppStore';
import { WorkflowTemplate } from '../types';

interface WorkflowTemplatesProps {
  onClose: () => void;
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'news-summary',
    name: '뉴스 요약',
    description: '특정 키워드의 최신 뉴스를 검색하고 요약합니다.',
    icon: '📰',
    inputs: {
      user_query: '엔비디아 최신 소식 알려줘',
    },
    example: {
      request: {
        inputs: { user_query: '엔비디아 최신 소식 알려줘' },
        response_mode: 'blocking',
      },
      response: {
        workflow_run_id: 'run_example',
        status: 'success',
        outputs: {
          answer: '엔비디아 관련 뉴스 요약...',
        },
      },
    },
  },
  {
    id: 'qa',
    name: '질문 답변',
    description: '일반적인 질문에 대한 답변을 생성합니다.',
    icon: '❓',
    inputs: {
      user_query: 'AI가 무엇인가요?',
    },
    example: {
      request: {
        inputs: { user_query: 'AI가 무엇인가요?' },
        response_mode: 'blocking',
      },
      response: {
        workflow_run_id: 'run_example',
        status: 'success',
        outputs: {
          answer: 'AI는 인공지능을 의미합니다...',
        },
      },
    },
  },
];

export function WorkflowTemplates({ onClose }: WorkflowTemplatesProps) {
  const { setCurrentRequest } = useDemoAppStore();

  const handleUseTemplate = (template: WorkflowTemplate) => {
    setCurrentRequest(template.example.request);
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>워크플로우 템플릿</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(template.inputs, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

