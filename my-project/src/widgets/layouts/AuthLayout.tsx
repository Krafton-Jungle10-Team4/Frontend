import { Outlet } from 'react-router-dom';

/**
 * 인증 페이지용 레이아웃 컴포넌트
 * 로그인, 회원가입 등 인증 관련 페이지에서 사용됩니다.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  );
}
