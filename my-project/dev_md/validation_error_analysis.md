# 검증 오류 상세 분석: 템플릿 변수 형식 오류

## 오류 메시지
```
노드 '1763305715179'의 템플릿 변수 'context' 형식이 잘못되었습니다
```

## 오류 발생 위치
- **노드 ID**: `1763305715179` (Response/Answer 노드)
- **URL**: `http://localhost:5173/bot/bot_1763305468_a2f40b0eb2/workflow`
- **오류 타입**: 템플릿 변수 형식 검증 오류

## 원인 분석

### 1. 템플릿 변수 형식 문제

#### 문제가 되는 템플릿
이미지에서 확인된 Response 노드의 템플릿:
```
{{LLM.context}}
```

#### 올바른 형식
템플릿 변수는 다음 형식을 따라야 합니다:
```
{{노드ID.포트이름}}
```

예시:
```
{{1763305619209.response}}  // LLM 노드의 response 출력 포트 참조
```

### 2. 구체적인 문제점

#### 문제 1: 노드 타입 이름 사용
- **잘못된 형식**: `{{LLM.context}}`
  - `LLM`은 노드 타입 이름이지 노드 ID가 아닙니다
  - 백엔드 검증 시 노드 ID로 노드를 찾을 수 없어 오류 발생

#### 문제 2: 잘못된 포트 참조
- **LLM 노드의 포트 구조**:
  - **입력 포트**: `query`, `context`, `system_prompt`
  - **출력 포트**: `response`, `tokens`, `model`
  
- `context`는 LLM 노드의 **입력 포트**이지 출력 포트가 아닙니다
- Response 노드에서 참조할 수 있는 것은 **출력 포트**만 가능합니다
- 따라서 `{{LLM.context}}`는 존재하지 않는 출력 포트를 참조하는 잘못된 형식입니다

### 3. 코드 레벨 분석

#### 프론트엔드 검증 로직
```29:31:my-project/src/features/workflow/components/nodes/answer/ValidationStatus.tsx
    const varPattern = /\{\{\s*([-\w]+\.[-\w]+)\s*\}\}/g;
    const matches = [...template.matchAll(varPattern)];
    const variables = matches.map((m) => m[1]);
```

- 정규식 패턴: `/\{\{\s*([-\w]+\.[-\w]+)\s*\}\}/g`
- 이 패턴은 `{{LLM.context}}`를 매칭하지만, `LLM`이 실제 노드 ID인지 확인하지 않습니다

```37:45:my-project/src/features/workflow/components/nodes/answer/ValidationStatus.tsx
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const varRef of variables) {
      const [refNodeId, portName] = varRef.split('.');

      if (!nodeIds.has(refNodeId)) {
        errors.push(`존재하지 않는 노드 '${refNodeId}' 참조`);
        continue;
      }
```

- 프론트엔드 검증에서는 `LLM`이 노드 ID 목록에 없으면 오류를 표시합니다
- 하지만 백엔드 검증에서도 동일한 검증이 수행되며, 더 엄격한 검증이 이루어집니다

#### 노드 표시 로직 (혼동의 원인)
```14:38:my-project/src/features/workflow/components/nodes/answer/node.tsx
  const formatTemplate = (template: string): string => {
    if (!template) return template;

    // {{nodeId.port}} 패턴을 찾아서 치환
    return template.replace(/\{\{(\d+)\.([^}]+)\}\}/g, (match, nodeId, portName) => {
      // 노드 ID로 노드 찾기
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return match; // 노드를 찾지 못하면 원본 유지

      // 노드 타입에서 사용자 친화적인 이름 생성
      const nodeTypeMap: Record<string, string> = {
        llm: 'LLM',
        'tavily-search': 'Search',
        'variable-assigner': 'Assigner',
        'template-transform': 'Template',
        'if-else': 'If/Else',
        'question-classifier': 'Classifier',
        start: 'Start',
        end: 'End',
      };

      const friendlyName = nodeTypeMap[node.data.type] || node.data.type.toUpperCase();
      return `{{${friendlyName}.${portName}}}`;
    });
  };
```

- **주의**: 이 함수는 **표시용**으로만 사용됩니다
- 실제 저장되는 템플릿 값은 `{{nodeId.port}}` 형식이어야 합니다
- 사용자가 노드 표시에서 `{{LLM.context}}`를 보고, 이를 그대로 템플릿에 입력하면 오류가 발생합니다

### 4. 백엔드 검증 프로세스

#### 검증 흐름
1. 프론트엔드에서 `transformToBackend`를 통해 백엔드 형식으로 변환
2. 백엔드 API (`/workflows/validate` 또는 `/bots/{bot_id}/workflows/validate`)로 전송
3. 백엔드에서 템플릿 변수 파싱 및 검증
4. 노드 ID 존재 여부 확인
5. 포트 존재 여부 및 타입 확인
6. 오류 발생 시 상세 메시지 반환

#### 백엔드 검증 오류 메시지 형식
```typescript
{
  is_valid: false,
  errors: [
    {
      node_id: "1763305715179",
      type: "template_validation",
      message: "노드 '1763305715179'의 템플릿 변수 'context' 형식이 잘못되었습니다",
      severity: "error"
    }
  ],
  warnings: []
}
```

## 해결 방법

### 즉시 해결 방법

1. **Response 노드의 템플릿 수정**
   - 현재: `{{LLM.context}}`
   - 수정: `{{<LLM노드ID>.response}}`
   - 예시: `{{1763305619209.response}}`

2. **올바른 변수 삽입 방법**
   - VariableSelector 컴포넌트를 사용하여 변수 삽입
   - VariableSelector는 올바른 `nodeId.portName` 형식으로 자동 삽입합니다

### 근본적인 해결 방법

#### 1. 프론트엔드 검증 강화
현재 프론트엔드 검증은 노드 ID 존재 여부만 확인합니다. 다음을 추가로 검증해야 합니다:
- 포트가 출력 포트인지 확인
- 포트 타입 검증
- 노드 타입 이름 대신 노드 ID만 허용

#### 2. 사용자 경험 개선
- 템플릿 입력 시 자동완성 기능 제공
- 잘못된 형식 입력 시 즉시 피드백
- 노드 표시와 실제 저장 값의 차이를 명확히 표시

#### 3. 템플릿 변수 형식 명확화
- 템플릿 입력 필드에 형식 힌트 표시
- 예시 템플릿 제공
- 변수 삽입 버튼 강조

## 관련 코드 위치

### 검증 로직
- 프론트엔드 검증: `my-project/src/features/workflow/components/nodes/answer/ValidationStatus.tsx`
- 백엔드 검증 API: `my-project/src/features/workflow/api/workflowApi.ts`
- 검증 결과 표시: `my-project/src/features/workflow/components/ValidationPanel/ValidationPanel.tsx`

### 템플릿 처리
- 템플릿 입력: `my-project/src/features/workflow/components/nodes/answer/panel.tsx`
- 변수 선택기: `my-project/src/features/workflow/components/nodes/answer/VariableSelector.tsx`
- 노드 표시: `my-project/src/features/workflow/components/nodes/answer/node.tsx`

### 데이터 변환
- 백엔드 변환: `my-project/src/shared/utils/workflowTransform.ts`
- 포트 스키마: `my-project/src/shared/constants/nodePortSchemas.ts`

## 참고 사항

### LLM 노드 포트 구조
```typescript
// 입력 포트
inputs: [
  { name: 'query', type: 'string', required: true },
  { name: 'context', type: 'string', required: false },
  { name: 'system_prompt', type: 'string', required: false }
]

// 출력 포트
outputs: [
  { name: 'response', type: 'string', required: true },
  { name: 'tokens', type: 'number', required: false },
  { name: 'model', type: 'string', required: false }
]
```

### 템플릿 변수 형식 규칙
1. **필수 형식**: `{{노드ID.포트이름}}`
2. **노드 ID**: 숫자 또는 영문자로 시작하는 문자열 (예: `1763305619209`, `llm_1`)
3. **포트 이름**: 영문자, 숫자, 하이픈, 언더스코어 사용 가능
4. **공백**: `{{` 와 `}}` 내부의 공백은 허용됨 (예: `{{ nodeId . portName }}`)

### 예시 템플릿
```javascript
// 올바른 예시
"{{1763305619209.response}}"
"{{start_1.user_message}}"
"{{llm_1.response}}"

// 잘못된 예시
"{{LLM.context}}"        // 노드 타입 이름 사용
"{{LLM.response}}"        // 노드 타입 이름 사용
"{{context}}"             // 노드 ID 없음
"{{1763305619209.context}}" // context는 입력 포트 (출력 포트 아님)
```

## 노드 포트 구조 설명

### 모든 노드가 입력/출력 포트를 모두 가져야 하는가?

**아니요.** 노드 타입에 따라 포트 구조가 다릅니다:

#### 1. Start 노드 (입력 포트 없음)
```typescript
inputs: []  // 빈 배열 - 워크플로우의 시작점
outputs: ['query', 'session_id']
```

#### 2. Answer 노드 (입력 포트 없음)
```typescript
inputs: []  // 빈 배열 - 템플릿 기반으로 직접 출력 생성
outputs: ['final_output']
```

#### 3. End 노드 (입력/출력 모두 있음)
```typescript
inputs: ['response']
outputs: ['final_output']
```

#### 4. 일반 처리 노드들 (입력/출력 모두 있음)
- **LLM 노드**: `inputs: ['query', 'context', 'system_prompt']`, `outputs: ['response', 'tokens', 'model']`
- **Knowledge Retrieval 노드**: `inputs: ['query']`, `outputs: ['context', 'documents', 'doc_count']`
- **Tavily Search 노드**: `inputs: ['query']`, `outputs: ['context', 'retrieved_documents', 'results', ...]`

### 포트 구조의 의미

1. **입력 포트가 없는 노드**:
   - **Start**: 외부에서 데이터를 받아 워크플로우를 시작
   - **Answer**: 템플릿을 기반으로 다른 노드의 출력을 참조하여 최종 응답 생성

2. **출력 포트가 없는 노드**:
   - 현재 시스템에는 없지만, 이론적으로 가능 (예: 로그만 기록하는 노드)

3. **입력/출력 모두 있는 노드**:
   - 데이터를 받아 처리하고 결과를 출력하는 일반적인 처리 노드

### 템플릿 변수 참조 규칙

- **Answer 노드의 템플릿**에서는 **다른 노드의 출력 포트만 참조 가능**
- 입력 포트는 참조할 수 없음 (입력 포트는 데이터를 받는 용도)
- 따라서 `{{LLM.context}}`는 잘못된 참조입니다:
  - `context`는 LLM 노드의 **입력 포트**이지 출력 포트가 아닙니다
  - LLM 노드의 출력 포트는 `response`, `tokens`, `model`입니다

## 중요한 발견: LLM 노드의 프롬프트 변수 사용법

### 사용자 지적 사항
> "이미 '컨텍스트'라는 곳에 뭘 가지고 올지 정해져있잖아. 프롬프트에 이상한 Nodeid.context랑 {{}} 이런거 쓸바에 그냥 컨텍스트에 있는 변수를 프롬프트에 넣으면 안돼?"

**완전히 맞는 지적입니다!** 시스템이 이미 이를 지원하고 있습니다.

### 현재 시스템의 동작 방식

#### LLM 노드의 프롬프트 변수 해석
```165:250:my-project/src/features/workflow/utils/promptVariableResolver.ts
    } else {
      // 포트 이름만 있는 경우 (예: {{context}})
      const portName = ref;
      const currentNode = nodes.find((n) => n.id === nodeId);
      
      if (!currentNode) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: '현재 노드를 찾을 수 없습니다',
          portName,
        });
        continue;
      }

      // 입력 포트인지 확인
      const inputPorts = currentNode.data?.ports?.inputs || [];
      const isInputPort = inputPorts.some((p) => p.name === portName);

      if (!isInputPort) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `입력 포트 '${portName}'가 존재하지 않습니다`,
          portName,
        });
        continue;
      }

      // 연결된 노드 찾기
      const connected = findConnectedNodeForInputPort(
        nodeId,
        portName,
        nodes,
        edges,
        variableMappings
      );

      if (!connected) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `입력 포트 '${portName}'에 연결된 노드가 없습니다`,
          portName,
        });
        continue;
      }

      // 연결된 노드의 출력 포트 확인
      const sourceNode = nodes.find((n) => n.id === connected.sourceNodeId);
      if (!sourceNode) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `연결된 노드 '${connected.sourceNodeId}'를 찾을 수 없습니다`,
          portName,
        });
        continue;
      }

      const outputPorts = sourceNode.data?.ports?.outputs || [];
      const hasOutputPort = outputPorts.some((p) => p.name === connected.sourcePortName);

      if (!hasOutputPort) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `연결된 노드에 출력 포트 '${connected.sourcePortName}'가 없습니다`,
          portName,
        });
        continue;
      }

      resolved.push({
        original: ref,
        resolved: `${connected.sourceNodeId}.${connected.sourcePortName}`,
        isValid: true,
        sourceNodeId: connected.sourceNodeId,
        portName,
      });
    }
```

#### 백엔드 변환 시 자동 해석
```57:86:my-project/src/shared/utils/workflowTransform.ts
          prompt_template: (() => {
            const prompt = (node.data as any).prompt || '';
            if (!prompt) return prompt;

            // 프롬프트 변수 해석: {{portName}} → {{nodeId.portName}}
            const variableMappings = node.data.variable_mappings;
            const resolvedVars = resolvePromptVariables(
              prompt,
              node.id,
              nodes,
              edges,
              variableMappings
            );

            // 해석된 변수로 프롬프트 변환
            let resolvedPrompt = prompt;
            resolvedVars.forEach((resolvedVar) => {
              if (resolvedVar.isValid && resolvedVar.resolved) {
                // {{portName}} 또는 {{original}} → {{resolved}}
                // 모든 인스턴스를 치환하기 위해 정규식 사용
                const originalPattern = new RegExp(
                  `\\{\\{\\s*${resolvedVar.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`,
                  'g'
                );
                const resolvedPattern = `{{${resolvedVar.resolved}}}`;
                resolvedPrompt = resolvedPrompt.replace(originalPattern, resolvedPattern);
              }
            });

            return resolvedPrompt;
          })(),
```

### 올바른 사용법

#### LLM 노드의 경우
1. **입력 매핑에서 연결**: "컨텍스트" 입력 필드에 "Tavily Search > 검색 컨텍스트" 연결
2. **프롬프트에 간단히 작성**: `{{context}}`만 사용
3. **자동 해석**: 시스템이 자동으로 `{{1763324415869.context}}` 형식으로 변환

**예시**:
```
// 프롬프트에 이렇게 쓰면:
{{context}}
다음은 최신 뉴스입니다:

// 백엔드로 전송될 때 자동으로 변환됨:
{{1763324415869.context}}
다음은 최신 뉴스입니다:
```

#### 불필요한 복잡한 형식
- ❌ `{{1763324415869.context}}` - 직접 노드 ID를 쓸 필요 없음
- ✅ `{{context}}` - 입력 매핑에서 이미 연결되어 있으면 이것만으로 충분

### 문제점 분석

#### 1. 사용자 경험 문제
- 사용자가 입력 매핑과 프롬프트 변수의 관계를 모를 수 있음
- UI에서 이 기능을 명확히 안내하지 않음
- Placeholder 텍스트가 혼란스러울 수 있음

#### 2. 이 문제가 LLM 노드에만 국한된가?
- **LLM 노드**: 입력 포트가 있어서 `{{portName}}` 형식 사용 가능 ✅
- **Answer 노드**: 입력 포트가 없어서 다른 노드의 출력 포트를 직접 참조해야 함 (`{{nodeId.portName}}` 형식 필수)
- 따라서 **LLM 노드에만 해당하는 편의 기능**입니다

### 개선 제안

1. **UI 개선**:
   - 프롬프트 입력 필드에 "입력 매핑에서 연결된 변수는 `{{변수명}}` 형식으로 사용하세요" 힌트 추가
   - VariableSelector에서 입력 포트에 연결된 변수를 우선 표시

2. **Placeholder 개선**:
   - 현재: `"예: {{context}}를 사용하여 답변하세요\n또는 {{nodeId.portName}} 형식으로 직접 참조할 수 있습니다"`
   - 개선: `"입력 매핑에서 연결된 변수는 {{변수명}} 형식으로 사용하세요\n예: {{context}}, {{query}}\n다른 노드를 직접 참조하려면 {{nodeId.portName}} 형식 사용"`

3. **자동 완성 개선**:
   - 입력 매핑에서 연결된 변수를 우선적으로 제안

## 결론

### 원래 검증 오류 (Answer 노드)
이 검증 오류는 **템플릿 변수 형식이 잘못되었기 때문**입니다:
1. 노드 타입 이름(`LLM`)을 노드 ID로 사용
2. 존재하지 않는 출력 포트(`context`) 참조 - `context`는 LLM 노드의 입력 포트입니다

**해결책**: Answer 노드의 템플릿을 올바른 형식(`{{노드ID.출력포트이름}}`)으로 수정해야 합니다.
- 올바른 예: `{{1763305619209.response}}` (LLM 노드의 출력 포트 참조)

### LLM 노드의 프롬프트 변수 사용법
**사용자 지적이 정확합니다!** LLM 노드에서는:
- 입력 매핑에서 연결된 변수는 `{{변수명}}` 형식만 사용하면 됩니다
- `{{nodeId.portName}}` 형식을 직접 쓸 필요가 없습니다
- 시스템이 자동으로 해석하여 백엔드 형식으로 변환합니다

**개선 필요**: UI/UX를 개선하여 사용자가 이 기능을 쉽게 이해하고 사용할 수 있도록 해야 합니다.

## 실제 런타임 오류: Answer 노드 템플릿 변수 문제

### 백엔드 로그 분석

#### 문제 현상
백엔드 실행 시 Answer 노드가 템플릿에서 **존재하지 않는 수많은 변수**를 참조하려고 시도합니다:

```
⚠️ WARNING | ❌ VariablePool에 1763324415869.model 없음!
⚠️ WARNING | ❌ VariablePool에 1763324415869.final_output 없음!
⚠️ WARNING | ❌ VariablePool에 1763324415869.tokens 없음!
⚠️ WARNING | ❌ VariablePool에 1763324415869.query 없음!
⚠️ WARNING | ❌ VariablePool에 1763324415869.response 없음!
... (수십 개의 경고)
```

#### 실제로 존재하는 변수들
```
✅ VariablePool에 start-1.query 존재
✅ VariablePool에 1763324415869.context 존재
✅ VariablePool에 1763324415869.results 존재
✅ VariablePool에 1763324441264.model 존재
✅ VariablePool에 1763324441264.tokens 존재
✅ VariablePool에 1763324441264.response 존재
✅ VariablePool에 start-1.session_id 존재
```

#### 핵심 에러
```
❌ ERROR | 포트 'operation_0_value'의 변수 '1763324456605.final_output'는 
         현재 실행 경로에 없는 노드입니다.
실행 경로: [start-1, 1763324441264, 1763324415869, 1763324364530, 1763324456605, 1763324320863] 
         → 1763324473414
```

### 문제 원인 분석

#### 1. Answer 노드 템플릿에 잘못된 변수 참조
- **1763324415869** (Tavily Search 노드)의 출력 포트:
  - ✅ `context`, `results`, `retrieved_documents`, `answer`, `result_count`, `response_time`
  - ❌ `model`, `final_output`, `tokens`, `query`, `response` (존재하지 않음)

- **1763324441264** (LLM 노드)의 출력 포트:
  - ✅ `response`, `tokens`, `model`
  - ❌ `final_output`, `query`, `context` (존재하지 않음)

- **start-1** (Start 노드)의 출력 포트:
  - ✅ `query`, `session_id`
  - ❌ `model`, `response`, `final_output`, `context` 등 (존재하지 않음)

#### 2. 프론트엔드 검증의 한계
현재 프론트엔드 검증 (`ValidationStatus.tsx`)은:
- ✅ 노드 ID 존재 여부 확인
- ✅ 포트 이름 존재 여부 확인
- ❌ **실제 실행 경로에서 사용 가능한 변수인지 확인하지 않음**
- ❌ **분기(if-else)로 인한 조건부 실행 경로 고려하지 않음**

#### 3. 템플릿 변수 추출 문제
```29:31:my-project/src/features/workflow/components/nodes/answer/ValidationStatus.tsx
    const varPattern = /\{\{\s*([-\w]+\.[-\w]+)\s*\}\}/g;
    const matches = [...template.matchAll(varPattern)];
    const variables = matches.map((m) => m[1]);
```

이 정규식은 템플릿에서 **모든** `{{nodeId.portName}}` 형식을 추출하지만:
- 템플릿에 주석이나 예시로 포함된 변수도 추출될 수 있음
- 실제로 사용하지 않는 변수도 추출됨
- 백엔드는 템플릿에서 추출한 모든 변수를 VariablePool에서 찾으려고 시도

### 해결 방법

#### 1. 즉시 해결
Answer 노드의 템플릿을 확인하고 **실제로 존재하는 출력 포트만 참조**하도록 수정:
- ❌ `{{1763324415869.model}}` → ✅ `{{1763324415869.context}}` 또는 `{{1763324415869.results}}`
- ❌ `{{1763324415869.final_output}}` → ✅ 존재하지 않음, 제거 필요
- ❌ `{{start-1.model}}` → ✅ `{{start-1.query}}` 또는 `{{start-1.session_id}}`

#### 2. 프론트엔드 검증 강화
`ValidationStatus.tsx`를 개선하여:
- 실제 노드의 출력 포트 스키마와 일치하는지 확인
- VariableSelector에서 제공하는 변수 목록과 일치하는지 확인
- 존재하지 않는 포트 참조 시 명확한 오류 메시지 제공

#### 3. 템플릿 정리
- 주석이나 예시로 포함된 변수 참조 제거
- 실제로 사용하는 변수만 템플릿에 포함

### 개선 제안

#### 1. ValidationStatus 개선
```typescript
// 현재: 포트 이름만 확인
if (!portNames.includes(portName)) {
  errors.push(`노드 '${refNodeId}'에 출력 포트 '${portName}'가 없습니다`);
}

// 개선: VariableSelector의 availableVariables와 비교
const availablePorts = getAvailablePortsForNode(refNodeId, nodeId, nodes, edges);
if (!availablePorts.includes(portName)) {
  errors.push(
    `노드 '${refNodeId}'의 출력 포트 '${portName}'는 현재 노드에서 접근할 수 없습니다. ` +
    `사용 가능한 포트: ${availablePorts.join(', ')}`
  );
}
```

#### 2. 템플릿 변수 추출 개선
- 주석 처리된 변수는 무시
- 실제 사용되는 변수만 추출
- 백엔드와 동일한 로직 사용

#### 3. 사용자 경험 개선
- VariableSelector에서 선택한 변수만 템플릿에 포함되도록 강제
- 템플릿 입력 시 자동완성으로 존재하는 변수만 제안
- 존재하지 않는 변수 참조 시 즉시 경고 표시

## 실제 런타임 오류 분석: 실행 경로 문제

### 새로운 로그 분석 (2025-11-18 08:08:50)

#### 핵심 에러
```
❌ ERROR | 포트 'operation_0_value'의 변수 '1763324456605.final_output'는 
         현재 실행 경로에 없는 노드입니다.
실행 경로: [start-1, 1763324441264, 1763324415869, 1763324364530, 1763324456605, 1763324320863] 
         → 1763324473414
```

#### 문제 분석

**1. 실행 경로와 변수 참조 불일치**
- 실행 경로: `[start-1, 1763324441264, 1763324415869, 1763324364530, 1763324456605, 1763324320863]`
- Answer 노드 (1763324456605)는 실행 경로에 **있음**
- 하지만 Assigner 노드 (1763324473414)가 Answer 노드의 `final_output`을 참조할 때 "실행 경로에 없는 노드"라고 판단됨

**2. 백엔드의 allowed_selectors 문제**
```
🔑 allowed_selectors: ['1763324415869.model', 'start-1.query', '1763324364530.content', 
   'self.target', '1763324364530.extracted', '1763324415869.final_output', ...]
```
- 백엔드가 **79개의 변수**를 `allowed_selectors`로 제공
- 하지만 실제 VariablePool에는 대부분이 없음
- 실제 존재하는 변수는 소수만:
  - ✅ `start-1.query`
  - ✅ `1763324415869.context`
  - ✅ `1763324415869.results`
  - ✅ `1763324441264.model`
  - ✅ `1763324441264.tokens`
  - ✅ `1763324441264.response`
  - ✅ `start-1.session_id`

**3. Answer 노드 템플릿**
```
🎨 AnswerNodeV2 템플릿: {{1763324441264.response}}...
Answer node 1763324456605 rendered: 1 variables, 508 chars
```
- 템플릿에는 `{{1763324441264.response}}`만 사용됨 (올바름)
- 하지만 백엔드는 79개의 변수를 모두 확인하려고 시도

**4. 실행 경로 문제의 원인**
- **분기 노드 (1763324320863)**의 영향:
  ```
  ⚠️ WARNING | 분기 노드 '1763324320863'의 분기 'if'와 'else'가 동일한 일반 노드로 합류합니다
  ```
- 실행 경로: `[start-1, 1763324441264, 1763324415869, 1763324364530, 1763324456605, 1763324320863]`
- Answer 노드 (1763324456605)는 실행되었지만, **특정 분기 경로에서만 실행됨**
- Assigner 노드 (1763324473414)가 Answer 노드를 참조할 때, **다른 실행 경로**에서 실행되려고 하면 문제 발생

### 문제의 근본 원인

#### 1. 백엔드의 allowed_selectors 생성 로직 문제
- 백엔드가 **모든 가능한 변수 조합**을 생성하여 제공
- 실제 실행 경로와 무관하게 모든 노드의 모든 포트를 나열
- 이로 인해 존재하지 않는 변수들이 `allowed_selectors`에 포함됨

#### 2. 실행 경로 추적 문제
- 백엔드가 실행 경로를 추적하지만, 변수 참조 시 실행 경로 검증이 제대로 작동하지 않음
- Answer 노드가 실행 경로에 있음에도 불구하고 "실행 경로에 없는 노드"라고 판단

#### 3. 분기 노드의 영향
- If-Else 노드로 인해 여러 실행 경로가 존재
- 특정 경로에서만 실행된 노드의 변수를 다른 경로에서 참조하려고 할 때 문제 발생

### 해결 방법

#### 1. 즉시 해결
- Assigner 노드 (1763324473414)의 변수 참조 확인
- Answer 노드의 `final_output` 대신 다른 방법 사용 고려
- 또는 워크플로우 구조 재설계

#### 2. 백엔드 개선 필요
- `allowed_selectors`를 실제 실행 경로 기반으로 생성
- 존재하지 않는 변수는 제외
- 실행 경로 추적 로직 개선

#### 3. 프론트엔드 개선
- 실제 실행 가능한 변수만 표시
- 분기 노드의 영향을 고려한 변수 필터링
- 실행 경로 기반 변수 검증

### 추가 발견 사항

**Answer 노드의 템플릿은 올바름**:
- 템플릿: `{{1763324441264.response}}`
- 실제로 존재하는 변수 사용
- 정상적으로 렌더링됨 (508 chars)

**문제는 Assigner 노드**:
- Assigner 노드가 Answer 노드의 `final_output`을 참조하려고 함
- 하지만 실행 경로 검증에서 실패
- 이는 백엔드의 실행 경로 추적 로직 문제일 가능성이 높음

## 프론트엔드 개선 완료

### 구현된 개선 사항

#### 1. ValidationStatus 강화 ✅
- **VariableSelector와 동일한 로직**으로 사용 가능한 변수 계산
- Upstream 노드 탐색 (BFS)을 통한 실제 접근 가능한 변수만 검증
- 출력 포트 존재 여부 검증 강화
- 더 명확한 오류 메시지 제공 (사용 가능한 포트 목록 표시)

#### 2. Placeholder 개선 ✅
- **Answer 노드**: 변수 선택기 사용을 강조하는 placeholder
- **LLM 노드**: 입력 매핑 변수 사용법을 명확히 안내하는 placeholder

### 개선된 검증 로직
```typescript
// 이전: 노드 ID와 포트 이름만 확인
if (!portNames.includes(portName)) {
  errors.push(`노드 '${refNodeId}'에 출력 포트 '${portName}'가 없습니다`);
}

// 개선: VariableSelector와 동일한 로직으로 실제 사용 가능한 변수만 검증
const availableVariables = getAvailableVariables(nodeId, nodes, edges);
if (!availableVariables.has(varKey)) {
  errors.push(
    `노드 '${refNodeId}'는 현재 노드에서 접근할 수 없는 노드입니다. ` +
    `변수 선택기를 사용하여 사용 가능한 변수만 선택하세요.`
  );
}
```

## 백엔드 개선 제안

### 1. allowed_selectors 생성 로직 개선

**현재 문제**:
- 모든 가능한 변수 조합을 생성 (79개)
- 실제 실행 경로와 무관하게 모든 노드의 모든 포트를 나열
- 존재하지 않는 변수들이 포함됨

**개선 제안**:
```python
# 현재: 모든 노드의 모든 포트를 나열
allowed_selectors = []
for node in all_nodes:
    for port in node.output_ports:
        allowed_selectors.append(f"{node.id}.{port.name}")

# 개선: 실제 실행 경로 기반으로 생성
def get_allowed_selectors(answer_node_id, execution_path, variable_pool):
    allowed = []
    # 실행 경로에 있는 노드만 고려
    for node_id in execution_path:
        if node_id in variable_pool:
            node_outputs = variable_pool[node_id]
            for port_name in node_outputs.keys():
                allowed.append(f"{node_id}.{port_name}")
    return allowed
```

### 2. 실행 경로 추적 로직 개선

**현재 문제**:
- Answer 노드가 실행 경로에 있음에도 "실행 경로에 없는 노드"라고 판단
- 분기 노드 처리 시 실행 경로 추적이 제대로 작동하지 않음

**개선 제안**:
```python
# 실행 경로 검증 로직 개선
def validate_variable_access(node_id, var_ref, execution_path):
    ref_node_id, port_name = var_ref.split('.')
    
    # 실행 경로에 있는지 확인
    if ref_node_id not in execution_path:
        return False, f"노드 '{ref_node_id}'는 실행 경로에 없습니다"
    
    # VariablePool에 실제로 존재하는지 확인
    if var_ref not in variable_pool:
        return False, f"변수 '{var_ref}'는 VariablePool에 없습니다"
    
    return True, None
```

### 3. 분기 노드 처리 개선

**현재 문제**:
- If-Else 노드로 인한 여러 실행 경로 처리 시 변수 참조 검증 실패
- 특정 경로에서만 실행된 노드의 변수를 다른 경로에서 참조하려고 할 때 문제 발생

**개선 제안**:
```python
# 분기 노드 처리 시 모든 가능한 실행 경로 고려
def get_all_possible_execution_paths(workflow, start_node):
    paths = []
    # BFS로 모든 가능한 경로 탐색
    # 분기 노드에서 여러 경로로 분기
    # 각 경로를 별도로 추적
    return paths

# 변수 참조 검증 시 모든 가능한 경로에서 접근 가능한지 확인
def is_variable_accessible(var_ref, all_possible_paths):
    for path in all_possible_paths:
        if is_accessible_in_path(var_ref, path):
            return True
    return False
```

### 4. VariablePool 초기화 개선

**현재 문제**:
- Answer 노드가 템플릿에서 추출한 모든 변수를 VariablePool에서 찾으려고 시도
- 존재하지 않는 변수에 대한 경고가 너무 많음

**개선 제안**:
```python
# 템플릿에서 실제로 사용되는 변수만 추출
def extract_used_variables(template):
    # 정규식으로 {{nodeId.portName}} 형식만 추출
    # 주석이나 예시는 무시
    pattern = r'\{\{\s*([-\w]+\.[-\w]+)\s*\}\}'
    matches = re.findall(pattern, template)
    return set(matches)

# 사용되는 변수만 VariablePool에서 확인
used_vars = extract_used_variables(template)
for var in used_vars:
    if var not in variable_pool:
        logger.warning(f"VariablePool에 {var} 없음!")
```

### 5. 에러 메시지 개선

**현재 문제**:
- "실행 경로에 없는 노드"라는 메시지가 명확하지 않음
- 어떤 실행 경로인지, 왜 접근할 수 없는지 명확하지 않음

**개선 제안**:
```python
# 더 명확한 에러 메시지
error_message = (
    f"포트 '{port_name}'의 변수 '{var_ref}'는 현재 실행 경로에서 접근할 수 없습니다. "
    f"실행 경로: {execution_path} → {current_node_id}. "
    f"이 변수는 다른 분기 경로에서만 사용 가능합니다."
)
```

## 프론트엔드에서 완료한 개선 사항 요약

1. ✅ **ValidationStatus 강화**: VariableSelector와 동일한 로직으로 실제 사용 가능한 변수만 검증
2. ✅ **출력 포트 검증 강화**: 노드 스키마와 실제 포트 비교
3. ✅ **명확한 오류 메시지**: 사용 가능한 포트 목록 표시
4. ✅ **Placeholder 개선**: 사용법을 명확히 안내

이제 프론트엔드에서 잘못된 변수 참조를 사전에 차단하여 백엔드로 전송되지 않도록 했습니다.

