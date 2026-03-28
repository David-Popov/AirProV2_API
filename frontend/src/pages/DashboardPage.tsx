import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Phone,
  Activity,
} from 'lucide-react'
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
    case 'Planned': return 'bg-primary/10 text-primary border-primary/20'
    case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'Canceled': return 'bg-muted text-muted-foreground border-border'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

function getMontageStatusLabel(status: string | null | undefined) {
  switch (status) {
    case 'InProgress': return 'In Progress'
    default: return status ?? 'Unknown'
  }
}

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

  const recentMontages = useMemo(() => {
    return [...allMontages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [allMontages])

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
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('common.dashboard')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('common.welcome', { name: user?.first_name })}
            {user?.company_name && (
              <span className="text-primary font-medium"> • {user.company_name}</span>
            )}
          </p>
        </div>
        <TimePeriodSelector
          value={timePeriod}
          onChange={setTimePeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* Trial Warning */}
      {user?.subscription_plan === 'FreeTrial' && user?.subscription_status === 'Trial' && user.trial_end_date && (
        <div className="mb-6 sm:mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2 bg-primary/20 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5 text-primary" />
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
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title={t('dashboard.active_montages')}
          value={quickStats.activeMontages.toString()}
          subtitle={t('dashboard.current')}
          icon={ClipboardList}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          className="animate-slide-up stagger-1"
        />
        <StatCard
          title={t('dashboard.completed_montages')}
          value={dashboardData.summary.completedMontages.toString()}
          subtitle={`${dashboardData.summary.completionRate}% ${t('dashboard.completion_rate')}`}
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
          trend={dashboardData.summary.montagesTrend}
          className="animate-slide-up stagger-2"
        />
        <StatCard
          title={t('dashboard.inventory_items')}
          value={quickStats.inventoryCount.toString()}
          subtitle={t('dashboard.low_stock_count', { count: quickStats.lowStockCount })}
          icon={Package}
          iconColor={quickStats.lowStockCount > 0 ? 'text-orange-500' : 'text-violet-500'}
          iconBg={quickStats.lowStockCount > 0 ? 'bg-orange-500/10' : 'bg-violet-500/10'}
          warning={quickStats.lowStockCount > 0}
          className="animate-slide-up stagger-3"
        />
        <StatCard
          title={t('dashboard.team_members')}
          value={quickStats.employeeCount.toString()}
          subtitle={t('common.active')}
          icon={Users}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          className="animate-slide-up stagger-4"
        />
      </div>

      {/* Revenue Chart — full width */}
      <div className="mb-6 sm:mb-8">
        <RevenueChart
          data={dashboardData.revenueByMonth as Array<{ month: string; revenue: number }>}
          totalRevenue={dashboardData.summary.totalRevenue}
          trend={dashboardData.summary.revenueTrend}
        />
      </div>

      {/* Montage Status (donut) + Payment Status (stacked bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <MontageStatusChart data={dashboardData.statusBreakdown} />
        <PaymentStatusChart data={dashboardData.paymentByMonth} />
      </div>

      {/* Monthly Activity Chart — full width */}
      <div className="mb-6 sm:mb-8">
        <MonthlyActivityChart data={dashboardData.activityByMonth as Array<{ month: string; created: number; completed: number }>} />
      </div>

      {/* Recent Activity + Active Montages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Recent Activity — 2/3 width */}
        <Card className="glass-card lg:col-span-2">
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
          <CardContent className="space-y-3">
            {recentMontages.length > 0 ? (
              recentMontages.map((m) => {
                const colorClass = getMontageStatusColor(m.status)
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/montages/${m.id}`)}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.client_city || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${colorClass}`}>
                      {getMontageStatusLabel(m.status)}
                    </Badge>
                  </div>
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

        {/* Recent Inventory Activity — 1/3 width */}
        <RecentInventoryActivity />
      </div>

      {/* Bottom Grid — Maintenance Reminders */}
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
                <div
                  key={montage.id}
                  onClick={() => navigate(`/montages/${montage.id}`)}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                    isOverdue
                      ? 'border-red-500/50 bg-red-500/5 hover:border-red-500'
                      : daysUntil <= 14
                        ? 'border-orange-500/50 bg-orange-500/5 hover:border-orange-500'
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
                </div>
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
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  trend?: number
  warning?: boolean
  className?: string
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, warning = false, className }: StatCardProps) {
  return (
    <Card className={`glass-card ${className ?? ''}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
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
        <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">{value}</p>
        <p className="text-xs sm:text-sm text-muted-foreground truncate pr-1">{title}</p>
        <p className={`text-xs mt-1 font-medium ${warning ? 'text-orange-500' : 'text-green-500'}`}>{subtitle}</p>
      </CardContent>
    </Card>
  )
}
