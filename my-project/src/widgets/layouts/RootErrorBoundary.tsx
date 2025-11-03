import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

/**
 * 라우터 레벨 에러를 처리하는 컴포넌트
 * 404, 401, 500 등 다양한 에러 상황에 대응합니다.
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  // React Router의 Response 에러인 경우
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
            <p className="mt-2 text-sm text-gray-500">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">401</h1>
            <p className="mt-4 text-xl text-gray-600">인증이 필요합니다</p>
            <p className="mt-2 text-sm text-gray-500">
              이 페이지에 접근하려면 로그인이 필요합니다.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              로그인하기
            </Link>
          </div>
        </div>
      );
    }

    if (error.status === 500) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">500</h1>
            <p className="mt-4 text-xl text-gray-600">서버 오류가 발생했습니다</p>
            <p className="mt-2 text-sm text-gray-500">
              일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      );
    }
  }

  // 일반 JavaScript 에러인 경우
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-900">오류</h1>
        <p className="mt-4 text-xl text-gray-600">예상치 못한 오류가 발생했습니다</p>
        <p className="mt-2 text-sm text-gray-500">
          {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
          >
            페이지 새로고침
          </button>
          <Link
            to="/"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
