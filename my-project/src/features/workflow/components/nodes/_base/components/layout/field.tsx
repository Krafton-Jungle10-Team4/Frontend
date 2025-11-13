/**
 * Field
 *
 * Label + 입력 컴포넌트를 감싸는 필드
 * 일관된 레이아웃과 spacing 제공
 */

import { Label } from '@shared/components/label';

interface FieldProps {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({
  label,
  description,
  required = false,
  children,
  className = '',
}: FieldProps) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};
