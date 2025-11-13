import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/dialog';
import { ScrollArea } from '@shared/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/tabs';
import { Button } from '@shared/components/button';
import { RiFileCopyLine, RiDownloadLine } from '@remixicon/react';
import { TypeBadge } from './TypeBadge';
import { PortDefinition } from '@shared/types/workflow/port.types';

interface VariableInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  port: PortDefinition;
  value: unknown;
  fullPath: string;
}

export function VariableInspector({
  open,
  onOpenChange,
  nodeId,
  port,
  value,
  fullPath,
}: VariableInspectorProps) {
  const { jsonValue, rawValue } = useMemo(() => {
    const json = JSON.stringify(value, null, 2);

    return {
      jsonValue: json,
      rawValue: String(value),
    };
  }, [value]);

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(jsonValue);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nodeId}-${port.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeBadge type={port.type} />
            {port.display_name}
          </DialogTitle>
          <DialogDescription>{fullPath}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="formatted" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <ValueRenderer value={value} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJSON}
                >
                  <RiFileCopyLine className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadJSON}
                >
                  <RiDownloadLine className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded-md border">
                <pre className="p-4 text-xs font-mono">{jsonValue}</pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {rawValue}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for rendering structured values
function ValueRenderer({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (value === undefined) {
    return <span className="text-muted-foreground italic">undefined</span>;
  }

  if (typeof value === 'string') {
    return <div className="whitespace-pre-wrap">{value}</div>;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="font-mono">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          Array ({value.length} items)
        </div>
        <div className="space-y-1 pl-4 border-l-2">
          {value.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-muted-foreground font-mono">[{index}]</span>
              <ValueRenderer value={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Object</div>
        <div className="space-y-1 pl-4 border-l-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="text-muted-foreground font-mono">{key}:</span>
              <ValueRenderer value={val} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <span className="text-muted-foreground italic">Unknown type</span>;
}
