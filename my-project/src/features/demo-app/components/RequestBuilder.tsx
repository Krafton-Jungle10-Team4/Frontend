import { useState } from 'react';
import { Textarea } from '@/shared/components/textarea';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { useDemoAppStore } from '../stores/demoAppStore';

export function RequestBuilder() {
  const { currentRequest, setCurrentRequest } = useDemoAppStore();
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleInputsChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setCurrentRequest({
        ...currentRequest,
        inputs: parsed,
      });
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inputs">Inputs (JSON)</Label>
        <Textarea
          id="inputs"
          value={JSON.stringify(currentRequest.inputs, null, 2)}
          onChange={(e) => handleInputsChange(e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
        {jsonError && (
          <p className="text-sm text-destructive">{jsonError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="responseMode">Response Mode</Label>
        <Select
          value={currentRequest.response_mode}
          onValueChange={(value: 'blocking' | 'streaming') =>
            setCurrentRequest({ ...currentRequest, response_mode: value })
          }
        >
          <SelectTrigger id="responseMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blocking">Blocking</SelectItem>
            <SelectItem value="streaming">Streaming</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

