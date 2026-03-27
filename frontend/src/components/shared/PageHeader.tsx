interface PageHeaderProps {
  title: string
  subtitle: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-slide-up">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5 leading-tight">
          {Icon && (
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </span>
          )}
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 ml-0.5">{subtitle}</p>
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  )
}
