import { FC, useState } from 'react';
import { Button } from '@shared/components/button';
import { PlusIcon } from 'lucide-react';
import { VariablePicker } from './VariablePicker';
import type { VarType } from '../types';

interface AddVariableButtonProps {
  nodeId: string;
  groupId?: string;
  filterType?: VarType;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const AddVariableButton: FC<AddVariableButtonProps> = ({
  nodeId,
  groupId,
  filterType,
  variant = 'outline',
  size = 'sm',
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowPicker(true)}
        className={className}
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Variable
      </Button>

      {showPicker && (
        <VariablePicker
          nodeId={nodeId}
          groupId={groupId}
          filterType={filterType}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};
