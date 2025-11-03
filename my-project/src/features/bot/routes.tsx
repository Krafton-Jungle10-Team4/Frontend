/**
 * Bot Feature Routes
 * Bot 관련 모든 라우트 정의
 */

import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage }))
);
const BotSetupPage = lazy(() =>
  import('./pages/BotSetupPage').then((module) => ({ default: module.BotSetupPage }))
);
const BotPreviewPage = lazy(() =>
  import('./pages/BotPreviewPage').then((module) => ({ default: module.BotPreviewPage }))
);

/**
 * Bot Feature Routes
 * /bots/* 경로 하위의 모든 라우트
 */
export const botRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/setup',
    element: <BotSetupPage />,
  },
  {
    path: '/preview/:id',
    element: <BotPreviewPage />,
  },
];
