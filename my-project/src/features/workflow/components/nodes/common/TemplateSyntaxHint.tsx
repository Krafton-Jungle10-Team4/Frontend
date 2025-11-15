import { Info } from 'lucide-react';

export const TemplateSyntaxHint = () => (
  <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
    <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
      <Info className="h-3.5 w-3.5" />
      템플릿 문법
    </div>
    <ul className="list-disc pl-5 space-y-0.5">
      <li><code className="font-mono">{'{{node.port}}'}</code> 기본 치환</li>
      <li><code className="font-mono">{'{{#node.array.0.title#}}'}</code> 형태로 중첩 속성과 배열 인덱스 접근</li>
      <li><code className="font-mono">{'{{conversation.summary}}'}</code>, <code className="font-mono">{'{{env.api_key}}'}</code> 등 특수 prefix 지원</li>
      <li>모든 변수는 Markdown으로 변환되며 파일/배열은 자동 서식 적용됩니다.</li>
    </ul>
  </div>
);
