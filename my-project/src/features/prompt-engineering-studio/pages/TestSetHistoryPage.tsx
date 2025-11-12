import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { ArrowLeft, Share, History, Workflow, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { mockTestSets } from '../data/mockTestSets';
import { StatPanel } from '../components/StatPanel';
import { PromptNavigation } from '../components/PromptNavigation';
import { ModelComparisonView } from '../components/ModelComparisonView';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/alert';
import { StudioSidebar } from '../components/layouts/StudioSidebar';

export function TestSetHistoryPage() {
  const { testSetId } = useParams<{ testSetId: string }>();
  const navigate = useNavigate();
  
  const testSet = mockTestSets.find((ts) => ts.id === testSetId);
  
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
    testSet?.prompts[0]?.id || null
  );

  const selectedPrompt = useMemo(() => {
    return testSet?.prompts.find((p) => p.id === selectedPromptId);
  }, [testSet, selectedPromptId]);

  const handleRestore = () => {
    if (testSet) {
      sessionStorage.setItem('restoredTestSet', JSON.stringify(testSet));
      toast.success('테스트 세트가 복원되었습니다. 스튜디오에서 확인하세요.');
      navigate('/prompt-studio');
    }
  };

  const handleApplyToWorkflow = () => {
    toast.success('Winner prompt and model have been applied to the workflow.');
  };

  const handleShare = () => {
    toast.info('Sharing function is not yet implemented.');
  };

  if (!testSet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Test set not found.</AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate('/prompt-studio/test-sets')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
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
              <Link to="/prompt-studio/test-sets" className="hover:text-white">Test Sets 히스토리</Link>
              <ChevronRight className="mx-2 size-4" />
              <span className="font-semibold text-white truncate max-w-xs">
                {testSet.name}
              </span>
            </div>

            {/* Main Title Area */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <FileText className="size-10 text-cyan-300 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {testSet.name}
                  </h1>
                  <p className="mt-2 text-lg text-gray-400">
                    프롬프트 엔지니어링 테스트 세트의 상세 결과를 분석하고 비교하세요.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                <Button onClick={handleApplyToWorkflow}>
                  <Workflow className="mr-2 h-4 w-4" />
                  워크플로우에 적용
                </Button>
                <Button variant="outline" onClick={handleRestore}>
                  <History className="mr-2 h-4 w-4" />
                  복원
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" />
                  공유
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-gray-200">
              핵심 지표
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <StatPanel type="winner" testSet={testSet} />
              <StatPanel type="selection" testSet={testSet} />
            </div>
          </div>

          {/* Prompt-by-Prompt Analysis Section */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-gray-200">
              프롬프트별 분석
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
              <div className="lg:col-span-1">
                <PromptNavigation prompts={testSet.prompts} selectedPromptId={selectedPromptId} onSelect={setSelectedPromptId} />
              </div>
              <div className="lg:col-span-2">
                {selectedPrompt && <ModelComparisonView prompt={selectedPrompt} testSet={testSet} />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
