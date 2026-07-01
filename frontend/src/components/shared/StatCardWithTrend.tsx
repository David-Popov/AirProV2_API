import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { useCountUp } from '@/hooks/useCountUp'

interface StatCardWithTrendProps {
  title: string
  value: number
  subtitle: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: number
  warning?: boolean
  variants?: Variants
}

/**
 * Dashboard stat card with an animated count-up value, an optional trend badge,
 * a warning/healthy subtitle, and a hover lift. Distinct from the simpler shared
 * `StatCard` (static, centered) — this one is the richer dashboard variant.
 */
export function StatCardWithTrend({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  warning = false,
  variants,
}: StatCardWithTrendProps) {
  const displayValue = useCountUp(value)

  return (
    <motion.div variants={variants} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
      <Card className="glass-card relative overflow-hidden h-full group">
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl bg-linear-to-br ${iconBg} shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} fill="currentColor" />
            </div>
            {trend !== undefined && trend !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}
                {trend}%
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1 tabular-nums">
            {displayValue}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate pr-1">{title}</p>
          <p className={`text-xs mt-1 font-medium ${warning ? 'text-orange-500' : 'text-emerald-500'}`}>{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
