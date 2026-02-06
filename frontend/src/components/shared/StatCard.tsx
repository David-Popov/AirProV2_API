import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  bgClassName: string
  label: string
  value: string | number
}

export function StatCard({ icon: Icon, iconClassName, bgClassName, label, value }: StatCardProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
        <div className={`p-1.5 sm:p-2 rounded-lg ${bgClassName} mb-1.5 sm:mb-2`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconClassName}`} />
        </div>
        <p className="text-muted-foreground text-[10px] sm:text-xs font-medium mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}
