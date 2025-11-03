/**
 * Auth Feature Public API
 * 다른 Feature에서 Auth Feature를 사용할 때 이 파일을 통해서만 import
 */

// Components
export { ProtectedRoute } from './components/ProtectedRoute';

// Hooks
export { useAuth } from './hooks/useAuth';

// Store
export { useAuthStore } from './stores/authStore';
export { useUserStore } from './stores/userStore';

// Types
export type {
  User,
  UserRole,
  AuthState,
  AuthResponse,
  GoogleLoginDto,
  GoogleLoginResponse,
  GoogleUserInfo,
  LogoutResponse,
} from './types/auth.types';
export { UserRole as AuthUserRole } from './types/auth.types';

// Routes (Router에서만 사용)
export { authRoutes } from './routes';

// Pages (Router에서만 사용)
export { LoginPage } from './pages/LoginPage';
export { AuthCallbackPage } from './pages/AuthCallbackPage';
