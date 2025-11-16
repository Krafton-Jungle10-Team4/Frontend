# If/Else 입력 엣지 가드 가이드

## 배경
- 백엔드 `WorkflowValidator`는 입력 핸들이 선언된 엣지를 보면 자동으로 `variable_mappings`를 생성한다.
- IF/ELSE 노드는 조건 변수(`conv.*`, `env.*`, `sys.*`)를 `variable_selector`로 읽어야 하지만, 프론트엔드가 Start → IfElse 엣지를 저장하면서 `target_handle=conv.result` 같은 값이 들어가면 validator가 이를 “입력 포트”로 착각해 잘못된 매핑을 만든다.
- 결과적으로 `conv.result` 대신 `start-1.query`가 입력으로 들어가 조건 분기가 항상 ELSE로 떨어지고, 실행 순서가 꼬인다.

## 변경 내용
1. **핸들 가드 추가**  
   `src/features/workflow/utils/logicalNodeGuards.ts`에 핸들이 없는 논리 노드(IF/ELSE 등)를 정의하고, 이 노드들로 들어오는 엣지의 `targetHandle`을 저장하지 않도록 필터링.
2. **ReactFlow 연결 시 즉시 정규화**  
   `WorkflowBuilder`의 `onConnect`에서 `sanitizeConnectionForLogicalTargets`를 거친 뒤 저장 → 사용자 입장에서는 선을 그릴 수 있지만, 데이터 전달은 끊긴다.
3. **스토어 전역 정리**  
   - `setEdges`, `addEdge`는 저장 직전에 모든 엣지를 sanitize.
   - 워크플로우 로드시(`normalizeWorkflowGraph`)도 backend 그래프를 sanitize해 과거 데이터까지 정리.
4. **IF/ELSE 포트 스키마 정리**  
   `generateIfElsePortSchema`가 더 이상 입력 포트를 만들지 않도록 수정. 조건에 필요한 변수는 패널에서 `variable_selector`로만 지정.

## 기대 효과
- Start → IfElse 같은 연결을 해도 `target_port`가 저장되지 않으므로 validator가 잘못된 variable mapping을 만들지 않는다.
- IF/ELSE 노드가 항상 `conversation.result`처럼 명시적으로 지정된 셀렉터만 읽어 Dify와 동일한 동작을 재현한다.
- 기존에 저장돼 있던 엣지도 로드 시 자동 정리되므로, 수동으로 JSON을 고칠 필요가 없다.

## 테스트 방법
1. 워크플로우 에디터에서 Start 노드와 IfElse 노드를 연결한다.
2. 저장 후 그래프 JSON을 확인하면 IfElse 노드의 `variable_mappings`가 비어 있고, 엣지에는 `targetHandle`이 없다.
3. 조건 패널에서 `conversation.result`를 선택하고 발행 → 백엔드 실행 시 `WorkflowValidator` 경고 없이 순서가 계산된다.
