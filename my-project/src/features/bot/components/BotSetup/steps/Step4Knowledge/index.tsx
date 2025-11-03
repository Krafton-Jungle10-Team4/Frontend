import { Link, Upload, FileText } from 'lucide-react';
import { useBotSetup } from '../../BotSetupContext';
import { WebsitesTab } from './WebsitesTab';
import { FilesTab } from './FilesTab';
import { TextTab } from './TextTab';
import type { Language } from '@/types';
import type { KnowledgeTab } from '../../types';

interface Step4KnowledgeProps {
  language: Language;
}

export function Step4Knowledge({ language }: Step4KnowledgeProps) {
  const { knowledgeTab, setKnowledgeTab } = useBotSetup();

  const translations = {
    en: {
      title: 'Knowledge',
      subtitle: 'Add knowledge sources to help your bot answer questions. You can add more later.',
      websites: 'Websites',
      files: 'Files',
      text: 'Text',
    },
    ko: {
      title: '지식',
      subtitle: '챗봇이 질문에 답변할 수 있도록 지식 소스를 추가하세요. 나중에 더 추가할 수 있습니다.',
      websites: '웹사이트',
      files: '파일',
      text: '텍스트',
    },
  };

  const t = translations[language];

  const tabs: Array<{ key: KnowledgeTab; label: string; icon: React.ElementType }> = [
    { key: 'websites', label: t.websites, icon: Link },
    { key: 'files', label: t.files, icon: Upload },
    { key: 'text', label: t.text, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-start border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setKnowledgeTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors text-sm ${
                knowledgeTab === tab.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {knowledgeTab === 'websites' && <WebsitesTab language={language} />}
        {knowledgeTab === 'files' && <FilesTab language={language} />}
        {knowledgeTab === 'text' && <TextTab language={language} />}
      </div>
    </div>
  );
}
