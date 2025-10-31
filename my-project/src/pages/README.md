# Pages

이 폴더는 라우팅에 연결되는 페이지 컴포넌트들을 포함합니다.

## 개념

Page는 **URL 경로와 1:1 매칭되는 최상위 컴포넌트**입니다.
여러 컴포넌트를 조합하여 하나의 완전한 화면을 구성합니다.

## 네이밍 규칙

- **파일명**: `PascalCasePage.tsx` (Page 접미사 권장)
- **폴더명**: URL 경로와 일치하도록 `kebab-case/` 또는 `PascalCase/`

## 디렉토리 구조 예시

```
pages/
├── HomePage.tsx           # 홈 화면 (/)
├── LoginPage.tsx          # 로그인 화면 (/login)
├── NotFoundPage.tsx       # 404 화면 (/404)
├── user/                  # 사용자 관련 페이지
│   ├── ProfilePage.tsx    # 프로필 화면 (/user/profile)
│   └── SettingsPage.tsx   # 설정 화면 (/user/settings)
└── product/               # 상품 관련 페이지
    ├── ProductListPage.tsx    # 상품 목록 (/product)
    └── ProductDetailPage.tsx  # 상품 상세 (/product/:id)
```

## 예시

### 기본 페이지 컴포넌트

```typescript
// src/pages/HomePage.tsx
import { Header } from '@components/common/Header';
import { ProductList } from '@components/features/product/ProductList';
import { Footer } from '@components/common/Footer';

export const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main>
        <h1>홈 페이지</h1>
        <ProductList />
      </main>
      <Footer />
    </div>
  );
};
```

### 동적 라우팅 페이지

```typescript
// src/pages/product/ProductDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useProduct } from '@hooks/useProduct';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div className="product-detail-page">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>가격: {product.price}원</p>
    </div>
  );
};
```

## 라우터 설정 예시 (React Router)

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { ProfilePage } from '@pages/user/ProfilePage';
import { NotFoundPage } from '@pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 작성 가이드

### 1. 페이지 컴포넌트의 역할
- ✅ 레이아웃 구성: 여러 컴포넌트를 조합
- ✅ 데이터 페칭: API 호출 및 데이터 관리
- ✅ 라우팅 매개변수 처리: URL params, query string 등
- ❌ 복잡한 UI 로직: 세부 UI는 components로 분리

### 2. 페이지 레이아웃 패턴

```typescript
export const ExamplePage = () => {
  // 1. 상태 관리
  const [data, setData] = useState([]);

  // 2. 라우팅 관련 hooks
  const navigate = useNavigate();
  const { id } = useParams();

  // 3. 데이터 페칭
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]);

  // 4. 레이아웃 구성
  return (
    <div className="page-container">
      <Header />
      <main>
        {/* 페이지별 컨텐츠 */}
      </main>
      <Footer />
    </div>
  );
};
```

### 3. 페이지 메타 정보 설정 (SEO)

```typescript
import { Helmet } from 'react-helmet-async';

export const ProductDetailPage = () => {
  return (
    <>
      <Helmet>
        <title>상품 상세 - My Shop</title>
        <meta name="description" content="상품 상세 정보를 확인하세요" />
      </Helmet>

      <div className="product-detail-page">
        {/* 페이지 컨텐츠 */}
      </div>
    </>
  );
};
```

## 주의사항

- ✅ 페이지 = 라우팅 단위: 각 페이지는 고유한 URL을 가져야 합니다
- ✅ 컴포넌트 조합: 복잡한 UI는 components에서 가져와 조합
- ✅ 데이터 관리: 페이지 레벨에서 필요한 데이터를 페칭하고 하위 컴포넌트로 전달
- ❌ 중복 코드 방지: 공통 레이아웃은 Layout 컴포넌트로 분리
- ❌ 비즈니스 로직 최소화: 복잡한 로직은 hooks나 utils로 분리
