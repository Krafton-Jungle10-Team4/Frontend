import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import type { VarType } from '../types';

interface VariablePickerProps {
  nodeId: string;
  groupId?: string;
  filterType?: VarType;
  onClose: () => void;
}

export const VariablePicker: FC<VariablePickerProps> = ({
  nodeId,
  groupId,
  filterType,
  onClose,
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Variable</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="text-center text-gray-400 py-8">
            No variables available
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
