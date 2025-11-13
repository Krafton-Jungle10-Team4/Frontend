# Variable Reference UI Components

워크플로우 노드에서 다른 노드의 출력 변수를 참조할 수 있는 UI 컴포넌트입니다.

## 컴포넌트

### VarReferencePicker

메인 변수 선택 컴포넌트입니다. Popover 기반으로 변수 목록을 표시하고 선택할 수 있습니다.

**특징:**
- ✅ Upstream 노드의 출력 변수 자동 감지
- ✅ 타입 필터링 (STRING 입력 → STRING 출력만 표시)
- ✅ 변수 검색 기능
- ✅ 최근 사용 변수 빠른 접근 (최대 10개)
- ✅ 변수 경로 표시 (`Node Name > Port Name`)

**사용 예시:**

```tsx
import { VarReferencePicker } from './components/variable';
import { PortType } from '@shared/types/workflow';

<VarReferencePicker
  nodeId={currentNode.id}
  portName="user_message"
  portType={PortType.STRING}
  value={currentVariableMapping}
  onChange={(selector) => handleVariableChange(selector)}
  placeholder="변수 선택..."
/>
```

### VariablePath

변수 경로를 표시하는 컴포넌트입니다.

```tsx
<VariablePath
  variable={selectedVariable}
  showType={true}    // 타입 뱃지 표시
  compact={false}    // 컴팩트 모드
/>
```

### VariableSelector

변수 목록의 개별 아이템 컴포넌트입니다. VarReferencePicker 내부에서 사용됩니다.

## 훅 (Hooks)

### useAvailableVariables

현재 노드에서 사용 가능한 변수 목록을 반환합니다.

**특징:**
- BFS 탐색으로 upstream 노드 자동 감지
- 타입 필터링 지원
- 순환 참조 방지 (현재 노드 제외)

```tsx
import { useAvailableVariables } from './hooks/useAvailableVariables';

const availableVars = useAvailableVariables(
  nodeId,
  PortType.STRING  // 선택사항: 타입 필터
);

// 반환 타입: VariableReference[]
// {
//   nodeId: string,
//   nodeTitle: string,
//   portName: string,
//   portDisplayName: string,
//   type: PortType,
//   fullPath: string  // "node_id.port_name"
// }
```

### useRecentVariables

최근 사용한 변수를 관리합니다 (localStorage 기반).

```tsx
import { useRecentVariables } from './hooks/useRecentVariables';

const {
  recentVariables,      // 최근 변수 배열
  addRecentVariable,    // 변수 추가
  clearRecentVariables  // 초기화
} = useRecentVariables();
```

## NodeConfigPanel 통합 가이드

### 1. 기본 통합 패턴

```tsx
import { VarReferencePicker } from '../variable';
import { PortType, ValueSelector } from '@shared/types/workflow';

export function MyNodePanel() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  // 변수 매핑 업데이트
  const handleVariableChange = (portName: string, selector: ValueSelector | null) => {
    const currentMappings = node.variable_mappings || {};

    updateNode(selectedNodeId!, {
      variable_mappings: {
        ...currentMappings,
        [portName]: selector ? {
          target_port: portName,
          source: selector
        } : undefined
      }
    });
  };

  return (
    <BasePanel>
      <Field label="입력 데이터">
        <VarReferencePicker
          nodeId={node.id}
          portName="input"
          portType={PortType.STRING}
          value={node.variable_mappings?.input?.source || null}
          onChange={(selector) => handleVariableChange('input', selector)}
        />
      </Field>
    </BasePanel>
  );
}
```

### 2. 변수 매핑 데이터 구조

```typescript
// 노드 데이터 구조
interface WorkflowNodeV2 {
  id: string;
  type: string;
  data: Record<string, unknown>;
  ports?: NodePortSchema;
  variable_mappings?: {
    [portName: string]: {
      target_port: string;
      source: {
        variable: string;      // "upstream_node_id.output_port"
        value_type: PortType;  // STRING, NUMBER, etc.
      };
    };
  };
}
```

### 3. 실제 사용 예시

`VarReferencePickerExample.tsx` 파일을 참고하세요. 다음 예시를 포함합니다:
- 필수 입력 포트
- 선택적 입력 포트
- 변수 선택 + 직접 입력 조합
- 다양한 타입의 포트

## 동작 원리

1. **Upstream 노드 감지**
   - React Flow의 edges를 BFS 탐색
   - 현재 노드로 연결된 모든 upstream 노드 찾기

2. **변수 목록 생성**
   - 각 upstream 노드의 outputs 포트 조회
   - 타입 필터링 적용 (호환되는 타입만)
   - VariableReference 객체로 변환

3. **변수 선택**
   - 사용자가 변수 선택
   - ValueSelector 객체 생성
   - node.variable_mappings 업데이트

4. **실행 시 Resolving** (백엔드)
   - 백엔드에서 variable_mappings 확인
   - Variable Pool에서 실제 값 조회
   - 입력 포트에 값 주입

## 타입 호환성

```typescript
// 호환성 규칙
function isTypeCompatible(sourceType: PortType, targetType: PortType): boolean {
  // ANY 타입은 모든 타입과 호환
  if (targetType === PortType.ANY) return true;
  if (sourceType === PortType.ANY) return true;

  // 같은 타입만 호환
  return sourceType === targetType;
}
```

## 최근 변수 관리

- localStorage에 최대 10개 변수 저장
- 키: `workflow_recent_variables`
- 최신순 정렬
- 사용 가능한 변수만 필터링하여 표시

## 주의사항

1. **순환 참조 방지**
   - 현재 노드는 변수 목록에서 제외됨
   - Downstream 노드도 제외됨

2. **타입 안정성**
   - 타입이 호환되지 않으면 변수 목록에 표시되지 않음
   - ANY 타입은 모든 타입과 호환

3. **변수 매핑 우선순위**
   - variable_mappings가 있으면 우선 사용
   - 없으면 node.data의 직접 입력 값 사용
   - 백엔드에서 resolving 시 이 순서를 따름

## 향후 개선 사항

- [ ] 변수 미리보기 (실행 전 값 확인)
- [ ] 변수 검증 (타입 체크)
- [ ] 변수 경로 자동 완성
- [ ] 변수 그룹핑 (노드 타입별)
