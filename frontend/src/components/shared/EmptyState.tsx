import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  message: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, message, description, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 text-muted-foreground animate-fade-in', className)}>
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
          <Icon className="w-8 h-8 opacity-40" />
        </div>
      )}
      <p className="font-medium text-foreground/70">{message}</p>
      {description && <p className="text-sm mt-1 max-w-xs mx-auto">{description}</p>}
    </div>
  )
}
