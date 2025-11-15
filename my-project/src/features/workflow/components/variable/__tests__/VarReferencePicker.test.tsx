import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VarReferencePicker } from '../VarReferencePicker';
import { PortType } from '@shared/types/workflow';
import { useAvailableVariables } from '@features/workflow/hooks/useAvailableVariables';
import { useRecentVariables } from '@features/workflow/hooks/useRecentVariables';

vi.mock('@shared/components/popover', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Popover: Wrapper,
    PopoverTrigger: Wrapper,
    PopoverContent: Wrapper,
  };
});

vi.mock('@shared/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@shared/components/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@features/workflow/hooks/useAvailableVariables', () => ({
  useAvailableVariables: vi.fn(),
}));

vi.mock('@features/workflow/hooks/useRecentVariables', () => ({
  useRecentVariables: vi.fn(),
}));

const mockedUseAvailableVariables = vi.mocked(useAvailableVariables);
const mockedUseRecentVariables = vi.mocked(useRecentVariables);

describe('VarReferencePicker', () => {
  beforeEach(() => {
    mockedUseAvailableVariables.mockReturnValue([]);
    mockedUseRecentVariables.mockReturnValue({
      recentVariables: [],
      addRecentVariable: vi.fn(),
    });
  });

  it('renders empty state guidance when no variables are available', () => {
    render(
      <VarReferencePicker
        nodeId="node-a"
        portName="query"
        portType={PortType.STRING}
        onChange={() => undefined}
      />
    );

    expect(
      screen.getByText('사용 가능한 변수가 없습니다. 먼저 연결선을 생성하세요.')
    ).toBeInTheDocument();
  });
});
