interface PageHeaderProps {
  title: string
  subtitle: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          {Icon && <Icon className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />}
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
