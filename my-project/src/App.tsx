import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/shared/components/sonner';
import { HomePage } from '@/features/bot/pages/HomePage';
import { BotSetupPage } from '@/features/bot/pages/BotSetupPage';
import { SetupCompletePage } from '@/features/bot/pages/SetupCompletePage';
import { BotPreviewPage } from '@/features/bot/pages/BotPreviewPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { WorkflowBuilderPage } from '@/features/workflow/pages/WorkflowBuilderPage';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/features/auth';

import './App.css';

export type { Language } from '@/shared/types';

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* 로그인 페이지 (인증 불필요) */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* 보호된 라우트들 (인증 필요) */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Bot Setup 관련 라우트 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<BotSetupPage />} />
        <Route path="/setup/complete" element={<SetupCompletePage />} />
        <Route path="/preview" element={<BotPreviewPage />} />

        {/* WorkflowBuilder 라우트 */}
        <Route path="/workflow-builder" element={<WorkflowBuilderPage />} />
        <Route path="/workflow" element={<WorkflowBuilderPage />} />

        {/* Fallback - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
