import { useState, useMemo } from 'react';
import { FilterTabs } from '../components/FilterTabs';
import { SearchBar } from '@shared/components/SearchBar';
import { TemplateCard } from '../components/TemplateCard';
import { mockTemplates, templateCategories } from '@/data/mockTemplates';
import { useUIStore } from '@shared/stores/uiStore';

export function ExplorePage() {
  const language = useUIStore(state => state.language);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter(template => {
      if (category !== 'all' && template.category !== category) {
        return false;
      }

      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [category, searchQuery]);

  const handleTemplateClick = (templateId: string) => {
    console.log('Template clicked:', templateId);
  };

  const filterTabs = templateCategories.map(cat => ({
    id: cat.id,
    label: cat.label[language] || cat.label.ko,
  }));

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex flex-col flex-1 overflow-hidden rounded-lg bg-background border border-gray-200/60 shadow-sm">
          <div className="p-6 pb-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {language === 'ko' ? (
                  <>
                    <span className="text-teal-500">SnapAgent</span>로 앱 탐색
                  </>
                ) : (
                  <>
                    Explore Apps with <span className="text-teal-500">SnapAgent</span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko'
                  ? '이 템플릿을 즉시 사용하거나 템플릿을 기반으로 고유한 앱을 사용하세요.'
                  : 'Use these templates instantly or create your own app based on a template.'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <FilterTabs
                tabs={filterTabs}
                activeTab={category}
                onTabChange={setCategory}
              />
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-48"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={handleTemplateClick}
                  language={language}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  {language === 'ko' ? '템플릿을 찾을 수 없습니다.' : 'No templates found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
