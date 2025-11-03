import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/sonner';
import { HomePage } from './pages/HomePage';
import { BotSetupPage } from './pages/BotSetupPage';
import { SetupCompletePage } from './pages/SetupCompletePage';
import { BotPreviewPage } from './pages/BotPreviewPage';

import WorkflowBuilder from '@/pages/WorkflowBuilder';

export type { Language } from './contexts/AppContext';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Home - Bot List */}
          <Route path="/" element={<HomePage />} />
          
          {/* Bot Setup - 4 Steps */}
          <Route path="/setup" element={<BotSetupPage />} />
          
          {/* Setup Complete */}
          <Route path="/setup/complete" element={<SetupCompletePage />} />
          
          {/* Bot Preview */}
          <Route path="/preview" element={<BotPreviewPage />} />

          {/* WorkflowBuilder를 위한 새 <Route> 추가 */}
          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
          
          {/* Fallback - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
