import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';

/**
 * 일반 로그인 폼 (이메일/비밀번호)
 * 화이트 테마로 업데이트
 */
interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm = ({ onSubmit, isLoading = false, error }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 유효성 검사
    if (!email || !password) {
      setValidationError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setValidationError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      // 에러는 부모 컴포넌트에서 처리
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이메일 입력 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50"
          required
        />
      </div>

      {/* 비밀번호 입력 */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50"
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? (
              <RiEyeOffLine className="h-5 w-5" />
            ) : (
              <RiEyeLine className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {(error || validationError) && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error || validationError}
        </div>
      )}

      {/* 로그인 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white shadow-lg shadow-gray-400/50 transition-all hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>로그인 중...</span>
          </div>
        ) : (
          '로그인'
        )}
      </button>
    </form>
  );
};
