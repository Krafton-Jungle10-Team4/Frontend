import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/collapsible';
import { Checkbox } from '@/shared/components/checkbox';
import { Plus, Trash2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useBotSetup } from '../../BotSetupContext';
import { ApiClient } from '@/shared/utils/api';
import { isValidUrl } from '@/shared/utils/validation';
import { generateTempId } from '@/shared/utils/session';
import { toast } from 'sonner';
import type { Language } from '@/shared/types';
import type { DiscoveredUrl } from '../../types';

interface WebsitesTabProps {
  language: Language;
}

export function WebsitesTab({ language }: WebsitesTabProps) {
  const {
    websites,
    setWebsites,
    sessionId,
    isDiscoveringUrls,
    setIsDiscoveringUrls,
  } = useBotSetup();

  const [currentWebsiteUrl, setCurrentWebsiteUrl] = useState('');

  const translations = {
    en: {
      websiteUrl: 'Website URL',
      add: 'Add',
      discoverUrls: 'Discover URLs',
      pages: 'pages',
      invalidUrl: 'Please enter a valid URL',
      websiteRemoved: 'Website removed',
      websiteDiscovered: 'Website discovered successfully',
      discoveryFailed: 'Failed to discover website',
      deleteFailedMessage: 'Failed to remove website',
    },
    ko: {
      websiteUrl: '웹사이트 URL',
      add: '추가',
      discoverUrls: 'URL 탐색',
      pages: '페이지',
      invalidUrl: '유효한 URL을 입력하세요',
      websiteRemoved: '웹사이트가 제거되었습니다',
      websiteDiscovered: '웹사이트를 성공적으로 탐색했습니다',
      discoveryFailed: '웹사이트 탐색에 실패했습니다',
      deleteFailedMessage: '웹사이트 제거에 실패했습니다',
    },
  };

  const t = translations[language];

  const handleAddWebsite = () => {
    if (!currentWebsiteUrl.trim()) return;

    if (!isValidUrl(currentWebsiteUrl.trim())) {
      toast.error(t.invalidUrl);
      return;
    }

    const newWebsite = {
      id: generateTempId(),
      url: currentWebsiteUrl.trim(),
      discovered: false,
    };

    setWebsites([...websites, newWebsite]);
    setCurrentWebsiteUrl('');
  };

  const handleRemoveWebsite = async (id: string) => {
    const website = websites.find((w) => w.id === id);

    if (website?.discovered) {
      // Website has been discovered - call backend
      try {
        // TODO: Replace with real API call when ready
        // await ApiClient.deleteWebsite(id);
        
        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        setWebsites(websites.filter((w) => w.id !== id));
        toast.success(t.websiteRemoved);
      } catch (error) {
        toast.error(t.deleteFailedMessage);
        console.error('Website delete error:', error);
      }
    } else {
      // Not yet discovered, just remove from state
      setWebsites(websites.filter((w) => w.id !== id));
    }
  };

  const handleDiscoverUrls = async (websiteId: string) => {
    const website = websites.find((w) => w.id === websiteId);
    if (!website) return;

    setIsDiscoveringUrls(websiteId);

    try {
      // TODO: Replace with real API call when ready
      // const data = await ApiClient.discoverUrls(website.url, sessionId);

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockUrls: DiscoveredUrl[] = [
        { id: '1', path: '/', selected: false },
        {
          id: '2',
          path: '/about-us',
          selected: false,
          children: [{ id: '2-1', path: '/about-us/team', selected: false }],
        },
        { id: '3', path: '/blog/hello-world', selected: false },
      ];

      setWebsites(
        websites.map((w) =>
          w.id === websiteId ? { ...w, discovered: true, urls: mockUrls } : w
        )
      );

      toast.success(t.websiteDiscovered);
    } catch (error) {
      toast.error(t.discoveryFailed);
      console.error('Discover URLs error:', error);
    } finally {
      setIsDiscoveringUrls(null);
    }
  };

  const toggleUrlSelection = (websiteId: string, urlId: string) => {
    setWebsites(
      websites.map((w) => {
        if (w.id !== websiteId || !w.urls) return w;

        const toggleUrl = (urls: DiscoveredUrl[]): DiscoveredUrl[] => {
          return urls.map((url) => {
            if (url.id === urlId) {
              return { ...url, selected: !url.selected };
            }
            if (url.children) {
              return { ...url, children: toggleUrl(url.children) };
            }
            return url;
          });
        };

        return { ...w, urls: toggleUrl(w.urls) };
      })
    );
  };

  const renderUrlTree = (websiteId: string, urls: DiscoveredUrl[], depth: number = 0) => {
    return urls.map((url) => (
      <div key={url.id} style={{ marginLeft: `${depth * 20}px` }}>
        <Collapsible>
          <div className="flex items-center gap-2 py-1">
            {url.children && url.children.length > 0 && (
              <CollapsibleTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </CollapsibleTrigger>
            )}
            {(!url.children || url.children.length === 0) && (
              <div className="w-6" />
            )}
            <Checkbox
              checked={url.selected}
              onCheckedChange={() => toggleUrlSelection(websiteId, url.id)}
            />
            <span className="text-sm text-gray-700">{url.path}</span>
          </div>
          {url.children && url.children.length > 0 && (
            <CollapsibleContent>
              {renderUrlTree(websiteId, url.children, depth + 1)}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Website URL Label */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">{t.websiteUrl}</label>
        
        {/* Add Website Input */}
        <div className="flex gap-2">
          <Input
            type="url"
            value={currentWebsiteUrl}
            onChange={(e) => setCurrentWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 h-11 bg-gray-50 border-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddWebsite();
              }
            }}
          />
          <Button
            onClick={handleAddWebsite}
            disabled={!currentWebsiteUrl.trim()}
            variant="outline"
            className="h-11 border-gray-300"
          >
            {t.add}
          </Button>
        </div>
      </div>

      {/* Advanced Settings (collapsed by default) */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronRight size={16} />
          Advanced settings
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="text-sm text-gray-500">
            {/* Advanced settings content would go here */}
            Additional configuration options
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Websites List */}
      {websites.length > 0 && (
        <div className="space-y-4">
          {websites.map((website) => (
            <div
              key={website.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 truncate flex-1">
                  {website.url}
                </p>
                <button
                  onClick={() => handleRemoveWebsite(website.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2"
                  title="Remove website"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {!website.discovered ? (
                <Button
                  onClick={() => handleDiscoverUrls(website.id)}
                  disabled={isDiscoveringUrls === website.id}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  {isDiscoveringUrls === website.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {language === 'ko' ? '탐색 중...' : 'Discovering...'}
                    </>
                  ) : (
                    t.discoverUrls
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    {website.urls?.length || 0} {t.pages}
                  </p>
                  <div className="max-h-60 overflow-y-auto border-t border-gray-100 pt-2">
                    {website.urls && renderUrlTree(website.id, website.urls)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
