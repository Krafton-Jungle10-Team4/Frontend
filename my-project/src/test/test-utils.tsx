import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * 커스텀 render 함수
 * 필요한 Provider들을 감싸서 컴포넌트를 렌더링합니다.
 *
 * 향후 React Router, Context Provider 등을 추가할 수 있습니다.
 */
export function renderWithProviders(
  ui: ReactElement,
  renderOptions?: RenderOptions
) {
  // 현재는 기본 render를 반환
  // 추후 Router, Context 등을 추가할 수 있습니다
  return render(ui, renderOptions);
}

// 기본 export로도 제공
export { renderWithProviders as render };
