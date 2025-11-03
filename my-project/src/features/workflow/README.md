# Workflow Feature

RAG (Retrieval-Augmented Generation) 워크플로우 빌더를 담당하는 Feature 모듈입니다. 시각적 노드 기반 워크플로우 편집 및 실행 기능을 제공합니다.

## 📁 디렉토리 구조

```
workflow/
├── __tests__/              # 단위 테스트
│   └── workflowStore.test.ts
├── api/                    # API 통신 레이어
│   └── workflowApi.ts
├── components/             # Workflow 관련 컴포넌트
│   ├── WorkflowBuilder/
│   │   ├── index.tsx
│   │   ├── Sidebar.tsx
│   │   └── Canvas.tsx
│   ├── nodes/              # 노드 컴포넌트
│   │   ├── StartNode.tsx
│   │   ├── EndNode.tsx
│   │   ├── LLMNode.tsx
│   │   ├── KnowledgeRetrievalNode.tsx
│   │   └── CustomNode.tsx
│   └── edges/              # 엣지 컴포넌트
│       └── CustomEdge.tsx
├── hooks/                  # Custom hooks
│   ├── useWorkflow.ts
│   ├── useWorkflowNodes.ts
│   └── useWorkflowEdges.ts
├── pages/                  # 페이지 컴포넌트
│   └── WorkflowBuilderPage.tsx
├── stores/                 # Zustand store
│   └── workflowStore.ts
├── types/                  # TypeScript 타입 정의
│   └── workflow.types.ts
├── utils/                  # 유틸리티 함수
│   └── workflowValidation.ts
├── routes.tsx              # Workflow Feature 라우트 정의
├── index.ts                # Public API
└── README.md
```

## 🎯 주요 기능

### 1. 워크플로우 빌더

- **드래그 앤 드롭**: React Flow 기반 노드 배치 및 연결
- **실시간 편집**: 노드 및 엣지 실시간 수정
- **자동 레이아웃**: 워크플로우 자동 정렬 및 최적화
- **Undo/Redo**: 작업 취소 및 재실행

### 2. 노드 타입

- **Start**: 워크플로우 시작 노드
- **End**: 워크플로우 종료 노드
- **LLM**: 대형 언어 모델 노드 (GPT-4, Claude 등)
- **Knowledge Retrieval**: 문서 검색 노드
- **Code**: 코드 실행 노드
- **HTTP Request**: 외부 API 호출 노드
- **If/Else**: 조건 분기 노드

### 3. 워크플로우 실행

- **시뮬레이션**: 워크플로우 실행 미리보기
- **디버깅**: 각 노드별 실행 결과 확인
- **로그**: 실행 과정 상세 로그 기록

## 📦 Public API

### Components

```typescript
import {
  WorkflowBuilder, // 워크플로우 빌더 메인 컴포넌트
  StartNode, // 시작 노드
  EndNode, // 종료 노드
  LLMNode, // LLM 노드
  KnowledgeRetrievalNode, // 검색 노드
  CustomEdge, // 커스텀 엣지
} from '@/features/workflow';
```

### Hooks

```typescript
import {
  useWorkflow, // 워크플로우 상태 및 액션
  useWorkflowNodes, // 노드 관리
  useWorkflowEdges, // 엣지 관리
} from '@/features/workflow';
```

### Store

```typescript
import {
  useWorkflowStore, // Workflow store hook
} from '@/features/workflow';
```

### Types

```typescript
import type {
  Node, // 노드 타입
  Edge, // 엣지 타입
  BlockEnum, // 노드 종류 열거형
  WorkflowState, // Workflow store 상태
  LLMConfig, // LLM 설정
  RetrievalConfig, // 검색 설정
} from '@/features/workflow';
```

### Pages

```typescript
import {
  WorkflowBuilderPage, // 워크플로우 빌더 페이지
} from '@/features/workflow';
```

## 🔗 라우트

Workflow Feature는 다음 라우트를 제공합니다:

```typescript
/workflow              → WorkflowBuilderPage (빌더 메인)
/workflow/builder      → WorkflowBuilderPage (빌더 메인)
```

## 🪝 Custom Hooks 사용 예시

### useWorkflow

```typescript
function WorkflowEditor() {
  const {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    selectedNode
  } = useWorkflow();

  const handleAddStartNode = () => {
    addNode({
      id: `start-${Date.now()}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        type: BlockEnum.Start,
        title: 'Start',
        desc: '워크플로우 시작',
      },
    });
  };

  return (
    <div>
      <button onClick={handleAddStartNode}>
        Add Start Node
      </button>
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}
```

### useWorkflowNodes

```typescript
function NodeManager() {
  const {
    nodes,
    addNode,
    updateNode,
    deleteNode,
    getNodeById
  } = useWorkflowNodes();

  const handleNodeClick = (nodeId: string) => {
    const node = getNodeById(nodeId);
    console.log('Selected node:', node);
  };

  return (
    <div>
      {nodes.map((node) => (
        <div key={node.id} onClick={() => handleNodeClick(node.id)}>
          {node.data.title}
        </div>
      ))}
    </div>
  );
}
```

### useWorkflowEdges

```typescript
function EdgeManager() {
  const {
    edges,
    addEdge,
    updateEdge,
    deleteEdge
  } = useWorkflowEdges();

  const handleConnect = (source: string, target: string) => {
    addEdge({
      id: `edge-${source}-${target}`,
      source,
      target,
      type: 'custom',
      data: {
        sourceType: BlockEnum.Start,
        targetType: BlockEnum.LLM,
      },
    });
  };

  return (
    <div>
      <button onClick={() => handleConnect('node-1', 'node-2')}>
        Connect Nodes
      </button>
    </div>
  );
}
```

## 🏪 Store 사용 예시

### 기본 사용

```typescript
function WorkflowCanvas() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const setEdges = useWorkflowStore((state) => state.setEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={setNodes}
      onEdgesChange={setEdges}
    />
  );
}
```

### 선택된 노드 관리

```typescript
function NodeProperties() {
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const selectNode = useWorkflowStore((state) => state.selectNode);

  if (!selectedNode) {
    return <p>No node selected</p>;
  }

  return (
    <div>
      <h3>{selectedNode.data.title}</h3>
      <p>{selectedNode.data.desc}</p>
      <button onClick={() => selectNode(null)}>
        Deselect
      </button>
    </div>
  );
}
```

## 🎨 노드 타입별 사용 예시

### Start Node

```typescript
const startNode: Node = {
  id: 'start-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    type: BlockEnum.Start,
    title: 'Start',
    desc: '사용자 질문 입력',
  },
};
```

### LLM Node

```typescript
const llmNode: Node = {
  id: 'llm-1',
  type: 'custom',
  position: { x: 400, y: 100 },
  data: {
    type: BlockEnum.LLM,
    title: 'GPT-4',
    desc: 'AI 응답 생성',
    model: {
      provider: 'OpenAI',
      name: 'GPT-4',
    },
    prompt: '다음 질문에 답변하세요: {{question}}',
    temperature: 0.7,
    maxTokens: 2000,
  },
};
```

### Knowledge Retrieval Node

```typescript
const retrievalNode: Node = {
  id: 'retrieval-1',
  type: 'custom',
  position: { x: 250, y: 100 },
  data: {
    type: BlockEnum.KnowledgeRetrieval,
    title: 'Knowledge Base',
    desc: '관련 문서 검색',
    dataset: 'Product Documentation',
    retrievalMode: 'Semantic Search',
    topK: 5,
    similarityThreshold: 0.8,
  },
};
```

## 🧪 테스트

### 테스트 실행

```bash
# Workflow Feature 테스트만 실행
npm test -- workflow

# Watch mode
npm test -- workflow --watch

# Coverage
npm test -- workflow --coverage
```

### 테스트 구조

- **workflowStore.test.ts**: Workflow store의 모든 기능 테스트
  - 노드/엣지 추가/삭제/업데이트
  - 노드 선택 관리
  - 워크플로우 유효성 검사

## 🔧 개발 가이드

### 새로운 노드 타입 추가하기

1. **타입 정의** (`types/workflow.types.ts`)

```typescript
export enum BlockEnum {
  // ... 기존 타입들
  Database = 'database',
}

export interface DatabaseNodeData extends BaseNodeData {
  type: BlockEnum.Database;
  query: string;
  connectionString: string;
}
```

2. **노드 컴포넌트 생성** (`components/nodes/DatabaseNode.tsx`)

```typescript
export function DatabaseNode({ data }: NodeProps<DatabaseNodeData>) {
  return (
    <div className="database-node">
      <div className="node-header">
        <DatabaseIcon />
        <span>{data.title}</span>
      </div>
      <div className="node-body">
        <p>{data.desc}</p>
        <code>{data.query}</code>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

3. **노드 타입 등록** (`components/WorkflowBuilder/index.tsx`)

```typescript
const nodeTypes = {
  custom: CustomNode,
  database: DatabaseNode, // 새 노드 타입 추가
};
```

4. **Public API 노출** (`index.ts`)

```typescript
export { DatabaseNode } from './components/nodes/DatabaseNode';
export type { DatabaseNodeData } from './types/workflow.types';
```

### 워크플로우 유효성 검사

```typescript
// utils/workflowValidation.ts
export function validateWorkflow(
  nodes: Node[],
  edges: Edge[]
): ValidationResult {
  const errors: string[] = [];

  // Start 노드 확인
  const startNodes = nodes.filter((n) => n.data.type === BlockEnum.Start);
  if (startNodes.length === 0) {
    errors.push('워크플로우에는 최소 1개의 Start 노드가 필요합니다.');
  }

  // End 노드 확인
  const endNodes = nodes.filter((n) => n.data.type === BlockEnum.End);
  if (endNodes.length === 0) {
    errors.push('워크플로우에는 최소 1개의 End 노드가 필요합니다.');
  }

  // 고립된 노드 확인
  const connectedNodeIds = new Set([
    ...edges.map((e) => e.source),
    ...edges.map((e) => e.target),
  ]);
  const isolatedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
  if (isolatedNodes.length > 0) {
    errors.push(`고립된 노드: ${isolatedNodes.map((n) => n.id).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 주의사항

⚠️ **성능 최적화**

- 많은 노드(100+)가 있을 때 React Flow 성능 저하 가능
- 노드 렌더링 최적화 (React.memo 사용)
- 엣지 애니메이션 신중하게 사용

⚠️ **상태 관리**

- 워크플로우 자동 저장 구현 권장
- 실행 취소/재실행 히스토리 관리
- 로컬 스토리지 또는 서버 동기화

⚠️ **타입 안정성**

- 노드 데이터 타입 엄격하게 관리
- 런타임 타입 검증 구현
- 워크플로우 직렬화/역직렬화 검증

## 📚 관련 문서

- [전체 아키텍처 문서](../../ARCHITECTURE.md)
- [React Flow 공식 문서](https://reactflow.dev/)
- [노드 개발 가이드](./components/nodes/README.md)
- [테스트 가이드](../../TESTING.md)

## 🤝 기여하기

1. Feature 브랜치 생성 (`feature/workflow-new-node`)
2. 변경사항 커밋
3. 테스트 작성 및 실행
4. Pull Request 생성

---

**Last Updated**: 2025-11-03
**Maintainer**: Frontend Team
