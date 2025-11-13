import { useState, useMemo } from 'react';
import { RiFileCopyLine, RiEyeLine, RiCheckLine } from '@remixicon/react';
import { Badge } from '@shared/components/badge';
import { Button } from '@shared/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/tooltip';
import { TypeBadge } from './TypeBadge';
import { VariableInspector } from './VariableInspector';
import { PortDefinition } from '@shared/types/workflow/port.types';
import { cn } from '@shared/utils/cn';

interface VariableTagProps {
  nodeId: string;
  port: PortDefinition;
  /**
   * Current value of the variable (if available)
   */
  value?: unknown;
  /**
   * Whether the variable has a value set
   */
  hasValue?: boolean;
  /**
   * Full variable path (nodeId.portName)
   */
  fullPath: string;
  /**
   * Whether to show copy button
   */
  showCopyButton?: boolean;
  /**
   * Whether to show inspect button
   */
  showInspectButton?: boolean;
  className?: string;
}

export function VariableTag({
  nodeId,
  port,
  value,
  hasValue = false,
  fullPath,
  showCopyButton = true,
  showInspectButton = false,
  className,
}: VariableTagProps) {
  const [copied, setCopied] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const valuePreview = useMemo(() => {
    if (!hasValue || value === undefined) return null;

    // Format value based on type
    if (typeof value === 'string') {
      return value.length > 30 ? `${value.slice(0, 30)}...` : value;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (Array.isArray(value)) {
      return `Array(${value.length})`;
    }
    if (typeof value === 'object' && value !== null) {
      return 'Object';
    }
    return String(value);
  }, [value, hasValue]);

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border p-2',
          hasValue ? 'border-primary/50 bg-primary/5' : 'border-border',
          className
        )}
      >
        <TypeBadge type={port.type} />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {port.display_name}
          </div>
          {hasValue && valuePreview && (
            <div className="text-xs text-muted-foreground truncate">
              {valuePreview}
            </div>
          )}
          <div className="text-xs text-muted-foreground truncate">
            {fullPath}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {showInspectButton && hasValue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectorOpen(true)}
                >
                  <RiEyeLine className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>변수 값 검사</TooltipContent>
            </Tooltip>
          )}

          {showCopyButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <RiCheckLine className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <RiFileCopyLine className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? '복사됨!' : '변수 경로 복사'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {showInspectButton && (
        <VariableInspector
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          nodeId={nodeId}
          port={port}
          value={value}
          fullPath={fullPath}
        />
      )}
    </>
  );
}
