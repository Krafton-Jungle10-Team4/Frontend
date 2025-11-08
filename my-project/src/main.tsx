import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

import './index.css';
import './styles/globals.css';
import { router } from './app/router';
import { AppProvider } from './features/bot/contexts/AppContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>
);
