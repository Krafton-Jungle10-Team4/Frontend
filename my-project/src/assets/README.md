# Assets

이 폴더는 정적 리소스 파일들을 포함합니다.

## 개념

**Assets 폴더**는 이미지, 폰트, 아이콘, 동영상 등 **애플리케이션에서 사용하는 정적 파일**을 관리합니다.

## 네이밍 규칙

- **파일명**: `kebab-case` 또는 `camelCase`
- **명확한 이름**: 용도를 알 수 있는 의미 있는 이름 사용

## 디렉토리 구조 예시

```
assets/
├── images/               # 이미지 파일
│   ├── logo.svg
│   ├── hero-banner.jpg
│   ├── user-avatar.png
│   └── icons/            # 아이콘 이미지
│       ├── check.svg
│       └── close.svg
├── fonts/                # 폰트 파일
│   ├── Pretendard-Regular.woff2
│   └── Pretendard-Bold.woff2
├── videos/               # 동영상 파일
│   └── intro.mp4
└── data/                 # 정적 데이터 (JSON 등)
    └── countries.json
```

## 예시

### 1. 이미지 import 및 사용

```typescript
// src/components/Header.tsx
import logo from '@assets/images/logo.svg';
import heroBanner from '@assets/images/hero-banner.jpg';

export const Header = () => {
  return (
    <header>
      <img src={logo} alt="로고" width={120} />
      <div style={{ backgroundImage: `url(${heroBanner})` }}>
        <h1>Welcome</h1>
      </div>
    </header>
  );
};
```

### 2. SVG 아이콘 컴포넌트화

```typescript
// src/assets/icons/CheckIcon.tsx
export const CheckIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

**사용 예시**:

```typescript
import { CheckIcon } from '@assets/icons/CheckIcon';

<CheckIcon size={32} color="#10b981" />
```

### 3. 커스텀 폰트 적용

```css
/* src/styles/fonts.css */
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-style: normal;
  src: url('@assets/fonts/Pretendard-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Pretendard';
  font-weight: 700;
  font-style: normal;
  src: url('@assets/fonts/Pretendard-Bold.woff2') format('woff2');
}

body {
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}
```

### 4. 정적 JSON 데이터 사용

```json
// src/assets/data/countries.json
[
  { "code": "KR", "name": "대한민국" },
  { "code": "US", "name": "미국" },
  { "code": "JP", "name": "일본" }
]
```

**사용 예시**:

```typescript
import countries from '@assets/data/countries.json';

export const CountrySelect = () => {
  return (
    <select>
      {countries.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
};
```

### 5. 동영상 파일 사용

```typescript
// src/components/IntroVideo.tsx
import introVideo from '@assets/videos/intro.mp4';

export const IntroVideo = () => {
  return (
    <video
      src={introVideo}
      autoPlay
      muted
      loop
      style={{ width: '100%', height: 'auto' }}
    >
      Your browser does not support the video tag.
    </video>
  );
};
```

### 6. 이미지 최적화 (Vite)

```typescript
// 다양한 해상도 이미지 import
import logoSmall from '@assets/images/logo.svg?w=100';
import logoMedium from '@assets/images/logo.svg?w=200';
import logoLarge from '@assets/images/logo.svg?w=400';

export const ResponsiveLogo = () => {
  return (
    <img
      src={logoLarge}
      srcSet={`${logoSmall} 100w, ${logoMedium} 200w, ${logoLarge} 400w`}
      sizes="(max-width: 600px) 100px, (max-width: 1200px) 200px, 400px"
      alt="로고"
    />
  );
};
```

## 이미지 포맷 가이드

### 권장 포맷

| 용도           | 포맷         | 이유                                 |
| -------------- | ------------ | ------------------------------------ |
| 로고, 아이콘   | SVG          | 확대해도 깨지지 않음, 파일 크기 작음 |
| 사진           | JPG/WebP     | 적절한 압축으로 품질 유지            |
| 투명 배경 필요 | PNG/WebP     | 알파 채널 지원                       |
| 애니메이션     | GIF/WebP/MP4 | WebP가 GIF보다 용량 작음             |

### 이미지 최적화 도구

- [TinyPNG](https://tinypng.com/) - PNG/JPG 압축
- [SVGO](https://github.com/svg/svgo) - SVG 최적화
- [Squoosh](https://squoosh.app/) - 다양한 포맷 변환 및 압축

## 파일 크기 가이드

```
✅ 적정 크기:
- 아이콘/로고: < 50KB
- 썸네일: < 100KB
- 일반 이미지: < 500KB
- 히어로 이미지: < 1MB

❌ 큰 파일은 CDN 또는 외부 스토리지 사용 고려
```

## public vs assets 폴더

### `src/assets/` (추천)

- **빌드 시 최적화됨** (압축, 해시 파일명)
- import로 사용
- Vite/Webpack이 처리

```typescript
import logo from '@assets/images/logo.svg';
// 빌드 후: /assets/logo-a1b2c3d4.svg
```

### `public/`

- **빌드 시 그대로 복사**
- 절대 경로로 사용
- 최적화 없음

```html
<img src="/images/logo.svg" alt="로고" />
```

**선택 기준**:

- ✅ `src/assets/`: 대부분의 경우 (import로 관리)
- ✅ `public/`: index.html에서 직접 참조하는 파일 (favicon, robots.txt 등)

## 환경별 이미지 처리

```typescript
// 개발/프로덕션 환경별 이미지
const baseURL = import.meta.env.VITE_CDN_URL || '';

export const getImageUrl = (path: string) => {
  return `${baseURL}${path}`;
};

// 사용
<img src={getImageUrl('/images/logo.svg')} alt="로고" />
```

## Lazy Loading 이미지

```typescript
export const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"  // 브라우저 네이티브 lazy loading
      decoding="async"
    />
  );
};
```

## 아이콘 라이브러리 사용 (선택사항)

```bash
npm install react-icons
```

```typescript
import { FaCheck, FaTimes, FaUser } from 'react-icons/fa';

export const Icons = () => (
  <div>
    <FaCheck size={24} color="green" />
    <FaTimes size={24} color="red" />
    <FaUser size={24} />
  </div>
);
```

## 작성 가이드

### 1. 파일 네이밍

```
✅ 좋은 예:
- user-avatar.png
- hero-banner-desktop.jpg
- icon-check.svg

❌ 나쁜 예:
- img1.png
- 이미지.jpg (한글)
- MyImage.PNG (대문자 확장자)
```

### 2. 폴더 구조

```
✅ 용도별로 분류:
assets/
  images/
    logos/
    icons/
    photos/
  fonts/
  videos/
```

### 3. 이미지 최적화

```typescript
// ✅ WebP 포맷 사용 (브라우저 지원 시)
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="이미지" />
</picture>

// ✅ 적절한 크기로 제공
// 모바일: 375px, 태블릿: 768px, 데스크톱: 1920px
```

## TypeScript 타입 선언 (vite-env.d.ts)

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

// 이미지 파일 import 타입
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}
```

## 주의사항

- ✅ 이미지는 압축하여 사용 (성능 최적화)
- ✅ SVG는 아이콘, 로고에 적극 활용
- ✅ WebP 포맷 사용 고려 (용량 50% 감소)
- ✅ 중요한 이미지는 lazy loading 사용
- ❌ 불필요하게 큰 원본 이미지 사용 지양
- ❌ 저작권 위반 이미지 사용 금지
- ❌ Base64 인코딩은 작은 이미지만 사용 (< 10KB)

## 유용한 리소스

### 무료 이미지

- [Unsplash](https://unsplash.com/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)

### 무료 아이콘

- [Heroicons](https://heroicons.com/)
- [Feather Icons](https://feathericons.com/)
- [React Icons](https://react-icons.github.io/react-icons/)

### 무료 폰트

- [Google Fonts](https://fonts.google.com/)
- [눈누](https://noonnu.cc/) - 한글 폰트
