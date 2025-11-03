import { useState, memo } from 'react';
import { DollarSign, Activity, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/tabs';
import { StatCard } from '@/shared/components/usage/UsageStats';
import { UsageChart } from '@/shared/components/usage/UsageChart';
import { ModelSelector } from '@/shared/components/usage/ModelSelector';
import { openAIUsage, geminiUsage, calculateSummary } from '@/shared/data/mockUsageData';

/**
 * 모니터링 뷰 - API 사용량 및 비용 통계
 */
const MonitoringView = () => {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  const currentProviderData = selectedProvider === 'openai' ? openAIUsage : geminiUsage;
  const models = Object.keys(currentProviderData);

  // 프로바이더 변경시 첫 번째 모델로 자동 선택
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const newModels = Object.keys(provider === 'openai' ? openAIUsage : geminiUsage);
    setSelectedModel(newModels[0]);
  };

  const currentData = currentProviderData[selectedModel] || [];
  const summary = calculateSummary(currentData);

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl">Usage</h1>
          <p className="text-muted-foreground">Monitor your API usage and costs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Tabs value={selectedProvider} onValueChange={handleProviderChange}>
            <TabsList>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Model:</span>
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Requests"
            value={summary.totalRequests.toLocaleString()}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Tokens"
            value={summary.totalTokens.toLocaleString()}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Cost"
            value={`$${summary.totalCost.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Avg Requests/Week"
            value={summary.averageRequestsPerDay.toLocaleString()}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <UsageChart data={currentData} />
      </div>
    </div>
  );
};

export default memo(MonitoringView);
