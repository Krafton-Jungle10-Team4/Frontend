import { FC, useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Input } from '@shared/components/input';
import { validateGroupName } from '../types/schema';

interface GroupHeaderInputProps {
  value: string;
  onChange: (newValue: string) => void;
}

export const GroupHeaderInput: FC<GroupHeaderInputProps> = ({
  value,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      setError('Group name cannot be empty');
      return;
    }

    if (!validateGroupName(trimmedValue)) {
      setError('Invalid group name (alphanumeric, _, - only)');
      return;
    }

    onChange(trimmedValue);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
      setError(null);
    }
  };

  if (!isEditing) {
    return (
      <h4
        className="font-semibold cursor-pointer hover:text-blue-600"
        onClick={() => setIsEditing(true)}
      >
        {value}
      </h4>
    );
  }

  return (
    <div>
      <Input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
