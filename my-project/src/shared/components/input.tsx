import * as React from 'react';

import { cn } from './utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'flex h-9 w-full min-w-0 rounded-md border border-border bg-background px-3 py-1 text-sm',
        'transition-all duration-200 outline-none',
        'hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'dark:bg-input dark:hover:border-border/60',
        className
      )}
      {...props}
    />
  );
}

export { Input };
