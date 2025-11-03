import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

/**
 * 애플리케이션의 최상위 레이아웃 컴포넌트
 * 모든 페이지에 공통으로 적용되는 요소들을 포함합니다.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}
