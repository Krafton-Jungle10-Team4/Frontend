import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';

/**
 * 일반 로그인 폼 (이메일/비밀번호)
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
        <label htmlFor="email" className="block text-sm font-medium text-teal-200 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>

      {/* 비밀번호 입력 */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-teal-200 mb-2">
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
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
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
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-200">
          {error || validationError}
        </div>
      )}

      {/* 로그인 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-teal-500 disabled:hover:to-cyan-500"
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
