import type { ComponentProps } from 'react';
import { cn } from '~/lib/utils';

export function Kbd({ className, children, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd className={cn("bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none text-xs", className)} {...props}>
      {children}
    </kbd>
  )
}