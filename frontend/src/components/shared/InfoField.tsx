import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfoFieldProps {
  /** The muted field label. */
  label: ReactNode
  /** Simple value rendered as a `<p>`. Ignored when `children` is provided. */
  value?: ReactNode
  /** Extra classes on the wrapper (e.g. `col-span-2`). */
  className?: string
  /** Extra classes on the default value `<p>` (e.g. `font-medium`). */
  valueClassName?: string
  /** Custom value content (icon rows, composite markup). Overrides `value`. */
  children?: ReactNode
}

/**
 * Labelled read-only field: a muted label above its value. Used on detail pages
 * for the repeated "label on top, value below" layout. Pass `value` for plain
 * text, or `children` for an icon row / composite value.
 */
export function InfoField({ label, value, className, valueClassName, children }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      {children ?? <p className={cn('text-foreground', valueClassName)}>{value}</p>}
    </div>
  )
}
