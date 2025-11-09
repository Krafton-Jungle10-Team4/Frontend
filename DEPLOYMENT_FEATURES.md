Research completed in 13m· 출처 13개· 검색 38건
Dify 지식베이스 챗봇 배포 방식 상세 분석
Dify의 지식베이스(ChatGPT) 챗봇은 3가지 방식으로 배포할 수 있습니다. 각 방식은 기술적 동작 방식과 사용자에게 보이는 결과물, 그리고 최종 사용자가 챗봇에 접근하는 방법에서 차이가 있습니다
milvus.io
wikidocs.net
. 아래에서는 ② 사이트에 삽입, ③ Explore에서 열기, ④ API를 통한 접근 각각에 대해 작동 메커니즘, 제공 형태, 사용자 UX(사용 방법) 관점에서 상세히 분석하고, 언제 어떤 방식이 적절한지 살펴보겠습니다.

.
1. 사이트에 삽입 (기존 웹사이트에 챗봇 임베드)
동작 방식: 기존 웹사이트에 챗봇을 내장하는 방식으로, Dify가 제공하는 임베드(embed) 코드를 페이지에 추가합니다. 기본적으로 <iframe> 태그를 사용하여 챗봇을 불러오는 방법을 지원하며, Dify 스튜디오의 해당 앱 카드에서 “사이트에 삽입” 옵션을 선택하면 iFrame 코드를 복사할 수 있습니다
docs.dify.ai
wikidocs.net
. 이 <iframe>은 Dify의 챗봇 웹앱을 다른 도메인의 페이지 안에 삽입하여 표시합니다. iFrame 외에도 <script> 스니펫을 제공하는데, 이를 사이트 <head>에 넣으면 하단에 챗봇 말풍선(bubble) 아이콘이 뜨고 클릭 시 챗봇 창이 열리며, <body>에 넣으면 전체 페이지를 차지하는 챗봇 UI를 생성합니다
docs.dify.ai
. 두 방법 모두 기술적으로는 Dify 서버와 통신하여 챗봇 UI와 기능을 불러오는 스크립트를 활용합니다 (예: 스크립트 방식은 필요 시 iFrame이나 DOM 요소를 동적으로 추가하여 챗봇을 표시).
결과물 형태: 최종 사용자에게는 기존 웹사이트 화면 내에 챗봇 인터페이스가 나타납니다. iFrame 방식을 사용하면 사이트의 한 섹션에 챗봇 대화창이 임베드되어 표시되며, 스크립트-버블 방식을 사용하면 화면 구석에 작은 챗봇 아이콘(말풍선 버튼)이 떠 있다가, 사용자가 클릭하면 오버레이 형태의 챗봇 창이 열립니다
docs.dify.ai
. 즉, 사용자는 현재 보고 있는 웹페이지를 떠나지 않고도 그 자리에서 바로 챗봇과 상호작용할 수 있게 됩니다. 챗봇 UI는 Dify의 기본 테마로 표시되지만, 개발자는 제공된 CSS 변수나 window.difyChatbotConfig 옵션으로 말풍선 버튼 스타일, 위치 등을 조정하여 사이트 디자인과 어울리게 커스터마이징할 수 있습니다
docs.dify.ai
docs.dify.ai
.
사용자 접근 방식: 웹사이트 방문자는 특정 페이지 섹션의 챗봇 박스를 통해 또는 화면 하단의 챗봇 아이콘(버블)을 눌러 대화를 시작합니다. 별도 링크를 따라갈 필요 없이 사이트 탐색 중에 즉시 질문할 수 있으므로, FAQ나 고객지원 봇으로 활용할 때 자연스러운 UX를 제공합니다. 예를 들어, 쇼핑몰 페이지에 상품 문의 챗봇을 iFrame으로 삽입하면 사용자는 상품 설명을 읽다가 바로 옆의 챗봇에게 질문할 수 있습니다. 버블 형태로 삽입하는 경우 사이트 어느 페이지에서나 이용자가 채팅 아이콘을 클릭해 문의를 시작할 수 있어 상담원 채팅같은 익숙한 경험을 줍니다.
적합한 활용 및 UX: 사이트에 삽입 방식은 기존 웹 환경에 AI 챗봇을 손쉽게 통합하고자 할 때 적절합니다. 별도 개발 없이 스크립트 한 줄 혹은 iFrame 코드만 삽입하면 되므로 난이도가 낮고, 호스팅된 챗봇 UI를 그대로 사용하기 때문에 일관된 동작이 보장됩니다
docs.dify.ai
. iFrame은 호스트 웹페이지와 챗봇 간의 환경 격리가 확보되어 스타일 충돌이 없고, 보안상 콘텐츠 격리가 필요한 경우 유용합니다. 다만 iFrame 크기를 고정해야 하므로 임베드 영역의 높이 등을 고려해야 하며, 작은 영역에 넣으면 스크롤이 생겨 UX가 떨어질 수 있습니다. 반면 스크립트 버블 방식은 화면 공간을 많이 차지하지 않다가 필요할 때 펼쳐지므로 방문자 경험을 해치지 않고 사이트 전반에 챗봇을 제공하는 데 유리합니다. 예를 들어 고객지원용 챗봇이나 지식베이스 FAQ 봇을 기업 홈페이지에 탑재하는典型 사례입니다.
2. Explore에서 열기 (Dify Explore 모드)
동작 방식: Dify 플랫폼의 “Explore” 모드를 통해 챗봇을 여는 방식입니다. Dify Cloud 또는 자가 설치 환경에서 Explore 화면은 여러 AI 애플리케이션을 한 곳에서 나열하고 실행할 수 있는 포털처럼 작동합니다. “Explore에서 열기” 옵션을 선택하면 해당 챗봇이 Dify의 Explore 페이지 내에서 실행되며, 이 페이지에는 다른 앱들도 함께 열람 가능하게 배치됩니다
wikidocs.net
. 기술적으로 이는 Dify가 제공하는 웹 대시보드 환경 안에서 챗봇을 구동하는 것으로, 별도의 iFrame이 아닌 Dify 자체 UI의 한 탭 혹은 화면으로 챗봇이 로드됩니다. (예: URL이 .../explore 경로를 가지며, Dify 서비스 내에서 동작)
결과물 형태: 최종 사용자에게는 Dify Explore 포털 페이지가 보이고, 그 안에 선택된 챗봇의 대화 인터페이스가 나타납니다. 이 화면에는 사이드바나 상단 메뉴 등을 통해 여러 다른 챗봇 앱을 목록으로 볼 수 있으며, 사용자는 현재 챗봇 외에 다른 앱을 즉시 선택하여 전환할 수 있습니다
wikidocs.net
. 따라서 하나의 챗봇만 꽉 채워진 독립 페이지와 달리, Explore 모드에서는 다중 앱 접근이 가능한 UI 레이아웃이 제공됩니다. 예를 들어 Explore 페이지 좌측에 "장난꾸러기 챗봇", "이메일 교정 봇", "지원 FAQ 봇" 등의 앱 목록이 있고, 우측 대화창에는 현재 선택된 챗봇과 대화하는 형태가 될 수 있습니다.
사용자 접근 방식: 사용자는 Explore 전용 페이지에 접속하여 챗봇을 사용합니다. 이 방식도 보통 URL 링크로 제공되지만, 열리는 페이지는 앞서 설명한 독립 웹앱과 달리 Dify의 전체 Explore 환경입니다. 사용자는 해당 챗봇으로 바로 대화할 수도 있고, 화면 내에서 다른 챗봇 앱을 클릭하여 이동할 수도 있습니다. UX 관점에서 앱 실행 방식과의 가장 큰 차이는, 사용자가 여러 AI 도구를 한 곳에서 탐색할 수 있다는 점입니다
wikidocs.net
. 예컨대 내부 직원들이 사용하는 AI 포털을 만든다면, Explore 모드로 공유하여 직원들이 한 페이지에서 다양한 업무 챗봇을 골라 쓰게 할 수 있습니다. 반면 특정 챗봇만 외부에 공개하고 싶을 때는 Explore보다는 앱 실행 링크를 직접 공유하는 편이 사용자가 다른 곳으로 이탈하지 않아 바람직합니다. 즉, Explore에서 열기는 다수의 챗봇을 운영하거나 AI 서비스 모음으로 제공할 때 적합하며, 앱 실행은 단일 챗봇을 독립적으로 제공할 때 유용합니다 (Explore 모드에선 다른 앱으로의 전환 가능성 때문에 집중도가 낮아질 수 있음).
앱 실행 vs Explore UX 비교: 앱 실행은 단일 챗봇 전용 화면을 띄워 사용자에게 몰입형 경험을 주는 반면, Explore 모드는 포털형 UX로 한 화면에서 여러 챗봇 간 전환의 용이성을 제공합니다. 따라서 앱 집중도와 다양한 앱 탐색성 측면에서 차이가 있습니다. 예를 들어, 고객에게 제품 상담 챗봇 하나만 제공할 때는 앱 실행 링크로 간결하게 제공하고, 사내 직원들에게 여러 업무별 챗봇(인사, 법무, IT지원 등)을 제공할 때는 Explore 모드를 활용해 한 번의 접근으로 모두 이용하게 할 수 있습니다.
3. API를 통한 접근 (프로그램틱 통합 방식)
동작 방식: 마지막 방식은 RESTful API를 통해 챗봇 기능에 접근하는 것입니다. Dify는 각 애플리케이션에 대해 백엔드 서비스 API를 제공하여, 개발자가 HTTP 호출로 챗봇에 질의하고 답변을 받을 수 있습니다
docs.dify.ai
docs.dify.ai
. Dify 스튜디오의 해당 앱 좌측 메뉴에서 “API 액세스” 항목을 선택하면 API 엔드포인트 정보와 예시, API Key 관리 화면이 나오는데, 여기서 발급받은 **비밀 키(secret)**를 HTTP 요청 헤더에 포함해 REST API를 호출하게 됩니다
docs.dify.ai
. 예컨대 대화형 챗봇의 경우 POST /v1/chat-messages 엔드포인트에 Authorization: Bearer {발급받은 키} 헤더와 질문(query), 필요한 경우 대화 ID(conversation_id) 등을 JSON 본문에 담아 호출합니다
docs.dify.ai
docs.dify.ai
. 이러한 API 호출을 처리하는 별도 백엔드 서버가 없을 경우를 위해, 프론트엔드에서 직접 호출할 수 있지만 API 키 노출 위험 때문에 일반적으로는 개발자 백엔드에서 대행 호출하는 것이 권장됩니다
docs.dify.ai
.
결과물 형태: API로 호출하면 Dify는 JSON 형식의 응답 데이터를 반환합니다. 여기에는 모델이 생성한 챗봇의 답변 텍스트(및 관련 메타데이터)가 포함됩니다. 응답은 한 번에 완료형으로 받을 수도 있고 response_mode: "streaming" 파라미터를 사용해 스트리밍 방식으로 토큰 단위 응답을 받을 수도 있습니다
docs.dify.ai
. 중요한 점은, 이 방식에서는 UI를 Dify가 제공하지 않으므로 최종 사용자에게 보이는 화면은 개발자가 직접 구성해야 한다는 것입니다. 다시 말해, API 호출 결과인 텍스트/데이터를 받아서 모바일 앱, 웹사이트, 채팅 애플리케이션 등 개발자가 원하는 인터페이스에 출력하게 됩니다. 또한 대화형 애플리케이션의 경우 지속적인 문맥 유지를 위해 Dify가 응답 시 제공하는 conversation_id를 이후 호출에 포함시켜 이전 대화 맥락을 이어갈 수 있도록 관리해야 합니다
docs.dify.ai
. API로 만든 대화 세션은 웹앱의 세션과 공유되지 않고 분리되어 운영되므로, 개발자가 원하는 형태로 대화 상태를 저장/활용할 수 있습니다
docs.dify.ai
.
사용자 접근 방식: 최종 사용자는 Dify가 아닌 개발자의 애플리케이션을 통해 간접적으로 챗봇을 이용하게 됩니다. 예를 들어 기업이 모바일 앱에 고객지원 챗봇을 넣고 싶다면, 앱 UI에서 사용자의 질문을 받아 REST API 호출로 Dify 챗봇 답변을 얻은 뒤, 그 답변을 다시 앱 채팅화면에 보여주는 식입니다. 이 때 사용자는 Dify의 존재를 의식하지 못하고, 자연스럽게 앱 내 기능으로서 챗봇을 경험합니다. 또 다른 예로, 사내 인트라넷이나 슬랙(Slack) 봇과 연동하는 시나리오를 들 수 있습니다. 슬랙 채널에서 사용자가 질문을 하면 백엔드에서 Dify API를 호출해 답변을 받고, 그 답변을 슬랙 메시지로써 전송해주는 챗봇 연동을 구현할 수 있습니다. 이처럼 API 방식은 사용자 인터페이스나 플랫폼을 개발자가 자유롭게 디자인하고, Dify는 백엔드 AI 답변 생성만 담당하는 형태로 활용됩니다
docs.dify.ai
.
적합한 활용 시나리오: API 참조 접근은 개발자 지향적인 통합 방식으로, 커스텀 애플리케이션 시나리오에 적합합니다
docs.dify.ai
. 예를 들어, 컨설팅 회사의 개발자가 자사 비공개 데이터베이스를 지식베이스로 한 AI 답변 서비스를 외부 고객에게 제공하려 할 때, 웹이나 앱의 UI는 맞춤 제작하고 백엔드에서 Dify API를 호출함으로써 데이터나 프롬프트 설계 로직은 노출하지 않고 서비스할 수 있습니다
docs.dify.ai
. 이 방식은 기존 시스템에 AI 챗봇 기능을 추가할 때도 유용한데, 별도의 UI 변경 없이 백단에서 API를 호출해 결과만 받아와 기존 워크플로우에 녹이는 것이 가능합니다. 단, 직접 개발이 수반되므로 앞선 노코드 배포 방식들(앱 실행, 임베드 등)에 비해 구현 작업량이 많지만, UI/기능의 유연한 커스터마이징과 다른 시스템과의 통합 측면에서 가장 강력한 옵션입니다. 요약하면, 웹/앱을 직접 개발하거나 기존 제품에 AI 챗봇을 삽입하려는 경우 또는 특정 플랫폼(예: 모바일, 챗봇 서버 등)에서 Dify 챗봇을 활용하고자 할 때 API 방식이 적절합니다.
🗒️ 배포 방식별 핵심 비교
아래 표는 Dify 지식베이스 챗봇의 배포 옵션을 기술 방식, 제공되는 형태(UI), 사용자 접근 형태 측면에서 비교 요약한 것입니다. 각 옵션의 특징과 적합한 활용 예시를 한눈에 볼 수 있도록 정리했습니다:
배포 방식	기술적 동작 방식 (Integration Mechanism)	결과물/UI 형태 (Output to User)	사용자 접근 및 UX (How Users Interact)	적합 활용 예시 (Use Case)

milvus.io
챗봇 전용 독립 웹 페이지
(풀스크린 대화 UI, 테마 커스터마이징 가능)
docs.dify.ai
사용자에게 링크로 제공 → 클릭 시 새 창/탭에서 챗봇 시작
다른 콘텐츠 없이 해당 챗봇에만 집중하여 사용	특정 챗봇 하나를 외부 공개, 빠른 PoC 및 데모 공유
예: 고객 Q&A 봇을 단일 링크로 배포
사이트에 삽입 (Embed in Site)	기존 웹사이트에 임베드 코드 추가
(<iframe> 또는 <script>로 챗봇 UI 불러옴)
docs.dify.ai
웹페이지 내 섹션으로 표시
– iFrame: 페이지 중단에 채팅창 임베드
– Script: 하단 챗봇 아이콘 또는 풀페이지 채팅창
docs.dify.ai
사용자는 사이트 탐색 중 즉시 챗봇 사용
– 임베드된 영역에서 바로 Q&A 진행
– 또는 화면 하단 버블 아이콘 클릭하여 대화 시작	기존 서비스나 홈페이지에 AI 챗봇 통합
예: 제품 페이지의 FAQ 챗봇, 고객지원 라이브챗 대체
Explore에서 열기 (Explore Mode)	Dify Explore 포털 내에서 앱 실행
(Dify 제공 다중앱 웹 인터페이스)	Explore 페이지 내 표시
(여러 앱 목록 + 선택된 챗봇 대화창 동시 제공)
다른 챗봇으로 UI 전환 가능	사용자는 Explore 포털에 접속하여 챗봇 이용
화면 내 다른 앱들도 바로 선택 가능
wikidocs.net


백엔드 통합 권장 (API Key 보안)
docs.dify.ai
UI 없음 (JSON 데이터 응답)
챗봇 응답 텍스트 및 메타데이터 반환
※ UI는 개발자가 별도 구현 필요	최종 사용자는 개발자 제공 인터페이스를 이용
(예: 모바일앱, 커스텀 웹챗 등에서 질문)
→ 앱이 백그라운드에서 API 호출하여 답변 제공	기존 시스템에 AI 기능 백엔드 연동
예: 모바일 앱 챗봇, Slack봇, 주문 시스템에 AI 답변 추가 등
각 배포 방식은 이처럼 장단점과 적용 맥락이 다르므로, Dify 사용 목적과 대상 사용자에 맞춰 적절한 방법을 선택해야 합니다. 예를 들어 웹 사이트 운영자라면 손쉽게 붙일 수 있는 사이트 삽입이 유용하고, 다양한 챗봇을 운영하는 기업은 Explore 모드로 일원화된 UX를 줄 수 있습니다. 반면 개발자라면 API 통합을 통해 원하는 플랫폼 어디에서나 Dify 챗봇을 활용하는 유연성을 얻을 수 있습니다. 이러한 배포 옵션의 존재는 Dify가 노코드부터 프로코드까지 폭넓은 활용을 지원한다는 것을 보여주며, 요구사항에 따라 iframe 임베드형 위젯부터 완전한 API 백엔드까지 선택적으로 사용할 수 있게 해줍니다
docs.dify.ai
docs.dify.ai
.



출처

Build a RAG Document Assistant in 10 Minutes | Dify & Milvus Tutorial - Milvus Blog

https://milvus.io/blog/hands-on-tutorial-build-rag-power-document-assistant-in-10-minutes-with-dify-and-milvus.md

03. 장난꾸러기 챗봇 만들기 - <Dify노트>

https://wikidocs.net/303961

Publish as a Single-page Web App - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/launch-your-webapp-quickly/README

Publish as a Single-page Web App - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/launch-your-webapp-quickly/README

Publish as a Single-page Web App - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/launch-your-webapp-quickly/README

Embedding In Websites - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/embedding-in-websites

03. 장난꾸러기 챗봇 만들기 - <Dify노트>

https://wikidocs.net/303961

Embedding In Websites - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/embedding-in-websites

Embedding In Websites - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/embedding-in-websites

Embedding In Websites - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/embedding-in-websites

03. 장난꾸러기 챗봇 만들기 - <Dify노트>

https://wikidocs.net/303961

03. 장난꾸러기 챗봇 만들기 - <Dify노트>

https://wikidocs.net/303961

03. 장난꾸러기 챗봇 만들기 - <Dify노트>

https://wikidocs.net/303961

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis

Developing with APIs - Dify Docs

https://docs.dify.ai/en/guides/application-publishing/developing-with-apis
모든 출처

milvus

wikidocs

docs.dify