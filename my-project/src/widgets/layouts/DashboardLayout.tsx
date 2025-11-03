import { Outlet } from 'react-router-dom';

/**
 * 대시보드 페이지용 레이아웃 컴포넌트
 * 사이드바와 메인 컨텐츠 영역을 포함합니다.
 */
export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-white">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
