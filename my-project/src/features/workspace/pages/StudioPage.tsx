import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBots } from '@/features/bot/hooks/useBots';
import { FilterSidebar } from '@/features/studio/components/FilterSidebar';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import { WorkflowGrid, type StudioWorkflowCard } from '@/features/studio/components/WorkflowGrid';
import { SortDropdown } from '@/features/studio/components/SortDropdown';

export function StudioPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

  const { bots, loading, error } = useBots({
    searchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    autoFetch: true,
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await botApi.getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        const allTags = new Set<string>();
        bots.forEach((bot) => {
          bot.tags?.forEach((tag) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
      }
    };

    fetchTags();
  }, [bots]);

  const [botVersions, setBotVersions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLatestVersions = async () => {
      const versionMap: Record<string, string> = {};

      await Promise.all(
        bots.map(async (bot) => {
          try {
            const versions = await workflowApi.listWorkflowVersions(bot.id, { status: 'published' });
            if (versions.length > 0) {
              versionMap[bot.id] = versions[0].version;
            }
          } catch (error) {
            console.error(`Failed to fetch versions for bot ${bot.id}:`, error);
          }
        })
      );

      setBotVersions(versionMap);
    };

    if (bots.length > 0) {
      fetchLatestVersions();
    }
  }, [bots]);

  const workflowStats = useMemo(() => {
    return {
      total: bots.length,
      running: bots.filter((bot) => bot.status === 'active').length,
      stopped: bots.filter((bot) => bot.status !== 'active').length,
    };
  }, [bots]);

  const workflowCards: StudioWorkflowCard[] = useMemo(() => {
    return bots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      description: bot.description,
      tags: bot.tags ?? [],
      status: bot.status === 'active' ? 'running' : bot.status === 'inactive' ? 'stopped' : 'draft',
      latestVersion: botVersions[bot.id],
      updatedAt: bot.updatedAt,
      deploymentState: undefined,
      marketplaceState: undefined,
    }));
  }, [bots, botVersions]);

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflowCards;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bot) =>
          bot.name.toLowerCase().includes(searchLower) ||
          bot.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((bot) =>
        selectedTags.some((tag) => bot.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [workflowCards, searchQuery, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleWorkflowClick = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  return (
    <div className="flex h-[calc(100vh-72px)]">
      <FilterSidebar
        tags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        workflowStats={workflowStats}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-studio-card-bg border-b border-studio-card-border px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-studio-tag-text">전체 워크플로우</p>
              <h1 className="text-2xl font-bold text-foreground">워크플로우 대시보드</h1>
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-destructive">
                오류가 발생했습니다: {error.message}
              </p>
            </div>
          ) : (
            <WorkflowGrid workflows={filteredAndSortedWorkflows} onWorkflowClick={handleWorkflowClick} />
          )}
        </div>
      </main>
    </div>
  );
}
