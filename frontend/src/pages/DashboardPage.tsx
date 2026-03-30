import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Phone, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ClipboardList,
  Package,
  Users,
  Activity,
  Sunrise,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context'
import { useMontages, useInventory, useEmployees } from '@/hooks'
import { useDashboardData } from '@/hooks/useDashboardData'
import { RecentInventoryActivity } from '@/components/inventory/RecentInventoryActivity'
import { DashboardSkeleton } from '@/components/skeletons'
import { TimePeriodSelector, getDateRange } from '@/components/dashboard/TimePeriodSelector'
import type { TimePeriodValue, DateRange } from '@/components/dashboard/TimePeriodSelector'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { MontageStatusChart } from '@/components/dashboard/MontageStatusChart'
import { PaymentStatusChart } from '@/components/dashboard/PaymentStatusChart'
import { MonthlyActivityChart } from '@/components/dashboard/MonthlyActivityChart'
import { usePageTitle } from '@/hooks/usePageTitle'

function getMontageStatusColor(status: string | null | undefined) {
  switch (status) {
    case 'Completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
    case 'InProgress': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'Planned':   return 'bg-primary/10 text-primary border-primary/20'
    case 'Overdue':   return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'Canceled':  return 'bg-muted text-muted-foreground border-border'
    default:          return 'bg-muted text-muted-foreground border-border'
  }
}

function getMontageStatusLabel(status: string | null | undefined) {
  switch (status) {
    case 'InProgress': return 'In Progress'
    default:           return status ?? 'Unknown'
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'good_morning',   Icon: Sunrise }
  if (h < 17) return { text: 'good_afternoon',  Icon: Sun }
  return           { text: 'good_evening',    Icon: Moon }
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
} as const

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState<TimePeriodValue>('6m')
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  const { data: montagesData, isLoading: isLoadingMontages } = useMontages(1, 100)
  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory(1, 100)
  const { data: employeesData } = useEmployees()

  const allMontages = montagesData?.items ?? []

  const dateRange = useMemo(() => {
    if (timePeriod === 'custom' && customRange) return customRange
    return getDateRange(timePeriod)
  }, [timePeriod, customRange])

  const dashboardData = useDashboardData(allMontages, dateRange.startDate, dateRange.endDate)

  const quickStats = useMemo(() => {
    const activeMontages = allMontages.filter(m =>
      m.status === 'InProgress' || m.status === 'Planned'
    ).length
    const inventoryCount = inventoryData?.totalCount ?? 0
    const lowStockCount = inventoryData?.items.filter(item => item.is_low_stock).length ?? 0
    const employeeCount = user?.roles.includes('Manager') ? (employeesData?.length ?? 0) : 0
    return { activeMontages, inventoryCount, lowStockCount, employeeCount }
  }, [allMontages, inventoryData, employeesData, user])

  const maintenanceReminders = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allMontages
      .filter(m => m.status === 'Completed' || m.payment_status === 'Paid')
      .map(m => {
        const installDate = new Date(m.completion_date || m.installation_date)
        const maintenanceDate = new Date(installDate)
        maintenanceDate.setFullYear(maintenanceDate.getFullYear() + 1)
        const timeDiff = maintenanceDate.getTime() - today.getTime()
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
        return { montage: m, maintenanceDate, daysUntil, isOverdue: daysUntil < 0 }
      })
      .filter(r => r.daysUntil <= 60)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)
  }, [allMontages])

  const recentMontages = useMemo(() =>
    [...allMontages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [allMontages]
  )

  const greeting = getGreeting()

  if (isLoadingMontages && isLoadingInventory) {
    return (
      <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('common.dashboard')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('common.welcome', { name: user?.first_name })}
          </p>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <motion.div
        className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "tween" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <greeting.Icon className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">
              {t(`common.${greeting.text}`, greeting.text.replace('_', ' '))}
              {user?.first_name && `, ${user.first_name}`}
            </span>
            {user?.company_name && (
              <span className="text-primary/60 font-medium text-sm">• {user.company_name}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-gradient">{t('common.dashboard')}</span>
          </h1>
        </div>
        <TimePeriodSelector
          value={timePeriod}
          onChange={setTimePeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </motion.div>

      {/* Trial Warning */}
      {user?.subscription_plan === 'FreeTrial' && user?.subscription_status === 'Trial' && user.trial_end_date && (
        <motion.div
          className="mb-6 sm:mb-8 p-4 bg-primary/8 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-2 bg-primary/20 rounded-full shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium">{t('dashboard.free_trial_title')}</h3>
            <p className="text-muted-foreground text-sm wrap-break-word">
              {t('dashboard.free_trial_desc', {
                date: new Date(user.trial_end_date).toLocaleDateString(),
                days: Math.ceil((new Date(user.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              })}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10 shrink-0"
            onClick={() => navigate('/settings?tab=subscription')}
          >
            {t('dashboard.upgrade_plan')}
          </Button>
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <StatCard
          title={t('dashboard.active_montages')}
          value={quickStats.activeMontages}
          subtitle={t('dashboard.current')}
          icon={ClipboardList}
          iconColor="text-primary"
          iconBg="from-primary/20 to-primary/5"
          variants={itemVariants}
        />
        <StatCard
          title={t('dashboard.completed_montages')}
          value={dashboardData.summary.completedMontages}
          subtitle={`${dashboardData.summary.completionRate}% ${t('dashboard.completion_rate')}`}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          iconBg="from-emerald-500/20 to-emerald-500/5"
          trend={dashboardData.summary.montagesTrend}
          variants={itemVariants}
        />
        <StatCard
          title={t('dashboard.inventory_items')}
          value={quickStats.inventoryCount}
          subtitle={t('dashboard.low_stock_count', { count: quickStats.lowStockCount })}
          icon={Package}
          iconColor={quickStats.lowStockCount > 0 ? 'text-orange-500' : 'text-violet-500'}
          iconBg={quickStats.lowStockCount > 0 ? 'from-orange-500/20 to-orange-500/5' : 'from-violet-500/20 to-violet-500/5'}
          warning={quickStats.lowStockCount > 0}
          variants={itemVariants}
        />
        <StatCard
          title={t('dashboard.team_members')}
          value={quickStats.employeeCount}
          subtitle={t('common.active')}
          icon={Users}
          iconColor="text-amber-500"
          iconBg="from-amber-500/20 to-amber-500/5"
          variants={itemVariants}
        />
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        className="mb-6 sm:mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, type: "tween" }}
      >
        <RevenueChart
          data={dashboardData.revenueByMonth as Array<{ month: string; revenue: number }>}
          totalRevenue={dashboardData.summary.totalRevenue}
          trend={dashboardData.summary.revenueTrend}
        />
      </motion.div>

      {/* Montage Status + Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <MontageStatusChart data={dashboardData.statusBreakdown} />
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1 }}
        >
          <PaymentStatusChart data={dashboardData.paymentByMonth} />
        </motion.div>
      </div>

      {/* Monthly Activity Chart */}
      <motion.div
        className="mb-6 sm:mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, type: "tween" }}
      >
        <MonthlyActivityChart data={dashboardData.activityByMonth as Array<{ month: string; created: number; completed: number }>} />
      </motion.div>

      {/* Recent Activity + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <motion.div
          className="lg:col-span-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-primary" />
                  {t('dashboard.recent_activity')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                  onClick={() => navigate('/montages')}
                >
                  {t('dashboard.view_all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentMontages.length > 0 ? (
                recentMontages.map((m, i) => {
                  const colorClass = getMontageStatusColor(m.status)
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                      onClick={() => navigate(`/montages/${m.id}`)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{m.client_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.client_city || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(m.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${colorClass}`}>
                        {getMontageStatusLabel(m.status)}
                      </Badge>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t('dashboard.no_recent_activity')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.1 }}
        >
          <RecentInventoryActivity />
        </motion.div>
      </div>

      {/* Maintenance Reminders */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              {t('dashboard.maintenance_reminders')}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('dashboard.maintenance_reminders_desc')}
            </p>
          </CardHeader>
          <CardContent>
            {maintenanceReminders.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {maintenanceReminders.map(({ montage, maintenanceDate, daysUntil, isOverdue }) => (
                  <motion.div
                    key={montage.id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate(`/montages/${montage.id}`)}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                      isOverdue
                        ? 'border-red-500/50 bg-red-500/5 hover:border-red-500 glow-red'
                        : daysUntil <= 14
                          ? 'border-orange-500/50 bg-orange-500/5 hover:border-orange-500 glow-orange'
                          : 'border-border bg-background/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`p-2 rounded-full shrink-0 ${
                        isOverdue ? 'bg-red-500/10' : daysUntil <= 14 ? 'bg-orange-500/10' : 'bg-primary/10'
                      }`}>
                        <Phone className={`w-4 h-4 ${
                          isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-primary'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm sm:text-base">{montage.client_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {montage.client_phone || t('common.no_phone')} • {montage.client_city || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className={`text-xs sm:text-sm font-medium ${
                        isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-primary'
                      }`}>
                        {maintenanceDate.toLocaleDateString()}
                      </p>
                      <p className={`text-xs font-medium ${
                        isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-muted-foreground'
                      }`}>
                        {isOverdue
                          ? t('dashboard.overdue_days', { days: Math.abs(daysUntil) })
                          : daysUntil === 0
                            ? t('dashboard.due_today')
                            : t('dashboard.due_in_days', { days: daysUntil })
                        }
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <AlertTriangle className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm sm:text-base">{t('dashboard.no_maintenance_due')}</p>
                <p className="text-xs sm:text-sm mt-1">{t('dashboard.maintenance_auto_calc')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Animated Number Counter ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return count
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
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

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, warning = false, variants }: StatCardProps) {
  const displayValue = useCountUp(value)

  return (
    <motion.div variants={variants} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
      <Card className="glass-card relative overflow-hidden h-full group">
        {/* Hover shimmer line */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${iconBg} shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} fill="currentColor" />
            </div>
            {trend !== undefined && trend !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
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
