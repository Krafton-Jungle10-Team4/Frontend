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
    name: 'Workflow Planning Assistant',
    description: 'An assistant that helps you plan and select the right node for a workflow (V0.6.0).',
    category: 'workflow',
    icon: '🤖',
    type: 'workflow',
    author: '채팅 플로우',
    tags: ['workflow', 'assistant', 'planning'],
  },
  {
    id: 'tpl-2',
    name: 'Question Classifier + Knowledge + Chatbot',
    description: 'Basic Workflow Template, a chatbot capable of identifying intents alongside with a knowledge base.',
    category: 'chatbot',
    icon: '💬',
    type: 'chatbot',
    author: '채팅 플로우',
    tags: ['chatbot', 'knowledge', 'classifier'],
  },
  {
    id: 'tpl-3',
    name: 'Knowledge Retrieval + Chatbot',
    description: 'Basic Workflow Template, A chatbot with a knowledge base.',
    category: 'chatbot',
    icon: '📚',
    type: 'chatbot',
    author: '채팅 플로우',
    tags: ['chatbot', 'knowledge', 'retrieval'],
  },
  {
    id: 'tpl-4',
    name: 'Automated Email Reply',
    description: 'Reply emails using Gmail API, It will automatically retrieve email in your inbox and create a response in Gmail.',
    category: 'agent',
    icon: '📧',
    type: 'agent',
    author: '채팅 플로우',
    tags: ['agent', 'email', 'automation'],
  },
  {
    id: 'tpl-5',
    name: 'Book Translation',
    description: 'A workflow designed to translate a full book up to 15000 tokens per run.',
    category: 'workflow',
    icon: '📖',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'translation', 'book'],
  },
  {
    id: 'tpl-6',
    name: 'Long Story Generator (Iteration)',
    description: 'A workflow demonstrating how to use Iteration node to generate long article that is longer than the context length of LLMs.',
    category: 'workflow',
    icon: '✍️',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'generation', 'iteration'],
  },
  {
    id: 'tpl-7',
    name: 'Text Summarization Workflow',
    description: "Based on users' choice, retrieve external knowledge to more accurately summarize articles.",
    category: 'workflow',
    icon: '📝',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'summarization', 'knowledge'],
  },
  {
    id: 'tpl-8',
    name: 'SEO Blog Generator',
    description: 'Workflow for retrieving information from the internet, followed by segmented generation of SEO blogs.',
    category: 'workflow',
    icon: '🌐',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'seo', 'blog'],
  },
  {
    id: 'tpl-9',
    name: 'Sentiment Analysis',
    description: 'Batch sentiment analysis of text, followed by JSON output of sentiment classification along with scores.',
    category: 'workflow',
    icon: '😊',
    type: 'workflow',
    author: '워크플로우',
    tags: ['workflow', 'sentiment', 'analysis'],
  },
];

export const templateCategories = [
  { id: 'all', label: { en: 'All', ko: '모든 카테고리' } },
  { id: 'agent', label: { en: 'Agent', ko: '에이전트' } },
  { id: 'workflow', label: { en: 'Workflow', ko: '워크플로우' } },
  { id: 'chatbot', label: { en: 'Chatbot', ko: '챗봇' } },
  { id: 'automation', label: { en: 'Automation', ko: '인사' } },
  { id: 'programming', label: { en: 'Programming', ko: '프로그래밍' } },
  { id: 'writing', label: { en: 'Writing', ko: '작성' } },
];
