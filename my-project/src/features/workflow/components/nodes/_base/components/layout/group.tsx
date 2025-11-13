/**
 * Group
 *
 * 관련된 필드들을 그룹화하는 섹션
 * 제목과 선택적 설명 제공
 */

interface GroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Group = ({
  title,
  description,
  children,
  className = '',
}: GroupProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};
