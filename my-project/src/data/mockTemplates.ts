export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  type: 'workflow' | 'chatbot' | 'agent';
  author: string;
  tags: string[];
}

export const mockTemplates: Template[] = [
  {
    id: 'tpl-1',
    name: '워크플로우 설계 도우미',
    description: '워크플로우를 설계하고 알맞은 노드를 고르는 데 도움을 주는 도우미(V0.6.0).',
    category: 'workflow',
    icon: '🤖',
    type: 'workflow',
    author: '채팅 플로우',
    tags: ['workflow', 'assistant', 'planning'],
  },
  {
    id: 'tpl-2',
    name: '질문 분류 + 지식베이스 + 챗봇',
    description: '질문 의도를 파악하고 지식베이스로 답변하는 기본 워크플로우 템플릿입니다.',
    category: 'chatbot',
    icon: '💬',
    type: 'chatbot',
    author: '채팅 플로우',
    tags: ['chatbot', 'knowledge', 'classifier'],
  },
  {
    id: 'tpl-3',
    name: '지식 검색 + 챗봇',
    description: '지식베이스를 갖춘 기본 챗봇 워크플로우 템플릿입니다.',
    category: 'chatbot',
    icon: '📚',
    type: 'chatbot',
    author: '채팅 플로우',
    tags: ['chatbot', 'knowledge', 'retrieval'],
  },
  {
    id: 'tpl-4',
    name: '자동 이메일 응답',
    description: 'Gmail API로 받은 메일을 자동으로 불러와 답장을 작성합니다.',
    category: 'agent',
    icon: '📧',
    type: 'agent',
    author: '채팅 플로우',
    tags: ['agent', 'email', 'automation'],
  },
  {
    id: 'tpl-5',
    name: '도서 번역',
    description: '실행마다 최대 15,000토큰 분량의 책을 번역하도록 설계된 워크플로우입니다.',
    category: 'workflow',
    icon: '📖',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'translation', 'book'],
  },
  {
    id: 'tpl-6',
    name: '장문 스토리 생성기(반복)',
    description: '반복 노드로 컨텍스트 길이를 넘어서는 긴 글을 생성하는 워크플로우 예제입니다.',
    category: 'workflow',
    icon: '✍️',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'generation', 'iteration'],
  },
  {
    id: 'tpl-7',
    name: '텍스트 요약 워크플로우',
    description: '사용자 선택에 따라 외부 지식을 불러와 더 정확하게 글을 요약합니다.',
    category: 'workflow',
    icon: '📝',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'summarization', 'knowledge'],
  },
  {
    id: 'tpl-8',
    name: 'SEO 블로그 생성기',
    description: '인터넷에서 정보를 수집한 뒤 나눠서 SEO 최적화 블로그를 작성합니다.',
    category: 'workflow',
    icon: '🌐',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'seo', 'blog'],
  },
  {
    id: 'tpl-9',
    name: '감정 분석',
    description: '텍스트를 일괄 감정 분석하고 점수와 함께 JSON으로 결과를 제공합니다.',
    category: 'workflow',
    icon: '😊',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'sentiment', 'analysis'],
  },
];

export const templateCategories = [
  { id: 'all', label: '모든 카테고리' },
  { id: 'agent', label: '서비스' },
  { id: 'workflow', label: '워크플로우' },
  { id: 'chatbot', label: '챗봇' },
  { id: 'automation', label: '인사' },
  { id: 'programming', label: '프로그래밍' },
  { id: 'writing', label: '작성' },
];
