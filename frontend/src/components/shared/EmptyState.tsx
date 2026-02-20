import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  message: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, message, description, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 text-muted-foreground', className)}>
      {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-20" />}
      <p>{message}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}
