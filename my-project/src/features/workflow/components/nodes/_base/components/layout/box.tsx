/**
 * Box
 *
 * 패널 내용을 감싸는 최상위 컨테이너
 * 일관된 spacing 제공
 */

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

export const Box = ({ children, className = '' }: BoxProps) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};
