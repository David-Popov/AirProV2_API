import { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Phone,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context'
import { useMontages, useInventory, useEmployees } from '@/hooks'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { RecentInventoryActivity } from '@/components/inventory/RecentInventoryActivity'
import { DashboardSkeleton } from '@/components/skeletons'

type TimePeriod = '1month' | '3months' | '6months' | '1year' | '2years'

interface RevenueDataPoint {
  month: string
  revenue: number
  count: number
}

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
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6months')

  const { data: montagesData, isLoading: isLoadingMontages } = useMontages(1, 100)
  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory(1, 100)
  const { data: employeesData } = useEmployees()

  const allMontages = montagesData?.items ?? []

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const activeMontages = allMontages.filter(m =>
      m.status === 'InProgress' || m.status === 'Planned'
    ).length
    const completedMontages = allMontages.filter(m => m.status === 'Completed').length
    const inventoryCount = inventoryData?.totalCount ?? 0
    const lowStockCount = inventoryData?.items.filter(item => item.is_low_stock).length ?? 0
    const employeeCount = user?.roles.includes('Manager') ? (employeesData?.length ?? 0) : 0

    // Trend: count completed this month vs last month
    const completedThisMonth = allMontages.filter(m => {
      const d = new Date(m.completion_date || m.installation_date)
      return m.status === 'Completed' && d >= thisMonthStart
    }).length
    const completedPrevMonth = allMontages.filter(m => {
      const d = new Date(m.completion_date || m.installation_date)
      return m.status === 'Completed' && d >= prevMonthStart && d < thisMonthStart
    }).length
    const completedTrend = completedPrevMonth > 0
      ? Math.round(((completedThisMonth - completedPrevMonth) / completedPrevMonth) * 100)
      : completedThisMonth > 0 ? 100 : 0

    // Revenue trend
    const revenueThisMonth = allMontages.filter(m => {
      const d = new Date(m.completion_date || m.installation_date)
      return (m.status === 'Completed' || m.payment_status === 'Paid') && d >= thisMonthStart
    }).reduce((s, m) => s + (m.paid_amount || m.total_price || 0), 0)

    const revenuePrevMonth = allMontages.filter(m => {
      const d = new Date(m.completion_date || m.installation_date)
      return (m.status === 'Completed' || m.payment_status === 'Paid') && d >= prevMonthStart && d < thisMonthStart
    }).reduce((s, m) => s + (m.paid_amount || m.total_price || 0), 0)

    const revenueTrend = revenuePrevMonth > 0
      ? Math.round(((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100)
      : revenueThisMonth > 0 ? 100 : 0

    return {
      activeMontages,
      completedMontages,
      inventoryCount,
      lowStockCount,
      employeeCount,
      completedTrend,
      revenueTrend,
      revenueThisMonth
    }
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

  const revenueData = useMemo((): RevenueDataPoint[] => {
    const now = new Date()
    let monthsBack = 6
    if (timePeriod === '1month') monthsBack = 1
    if (timePeriod === '3months') monthsBack = 3
    if (timePeriod === '1year') monthsBack = 12
    if (timePeriod === '2years') monthsBack = 24

    const data: RevenueDataPoint[] = []
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthMontages = allMontages.filter(m => {
        const isCompleted = m.status === 'Completed'
        const isPaid = m.payment_status === 'Paid'
        if (!isCompleted && !isPaid) return false
        const dateStr = m.completion_date || m.installation_date
        if (!dateStr) return false
        const montageDate = new Date(dateStr)
        return montageDate.getFullYear() === year && montageDate.getMonth() === month
      })
      const revenue = monthMontages.reduce((sum, m) => sum + (m.paid_amount || m.total_price || 0), 0)
      const monthName = date.toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : 'en-US', {
        month: monthsBack <= 3 ? 'long' : 'short',
        year: monthsBack > 12 ? '2-digit' : undefined
      })
      data.push({ month: monthName, revenue, count: monthMontages.length })
    }
    return data
  }, [allMontages, timePeriod, i18n.language])

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0)
  const totalMontagesInPeriod = revenueData.reduce((sum, d) => sum + d.count, 0)

  // Trend vs previous period
  const periodTrend = useMemo(() => {
    const len = revenueData.length
    if (len < 2) return 0
    const half = Math.floor(len / 2)
    const recent = revenueData.slice(half).reduce((s, d) => s + d.revenue, 0)
    const previous = revenueData.slice(0, half).reduce((s, d) => s + d.revenue, 0)
    return previous > 0 ? Math.round(((recent - previous) / previous) * 100) : recent > 0 ? 100 : 0
  }, [revenueData])

  // Recent activity: last 5 montages sorted by created_at desc
  const recentMontages = useMemo(() => {
    return [...allMontages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [allMontages])

  // Active montages for bottom table
  const activeMontagesList = useMemo(() => {
    return allMontages
      .filter(m => m.status === 'InProgress' || m.status === 'Planned')
      .slice(0, 8)
  }, [allMontages])

  if (isLoadingMontages && isLoadingInventory) {
    return (
      <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
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
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('common.dashboard')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('common.welcome', { name: user?.first_name })}
          {user?.company_name && (
            <span className="text-primary font-medium"> • {user.company_name}</span>
          )}
        </p>
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

      {/* Stat Cards — 4 columns with trend badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title={t('dashboard.active_montages')}
          value={stats.activeMontages.toString()}
          subtitle={t('dashboard.current')}
          icon={ClipboardList}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatCard
          title={t('dashboard.completed_montages')}
          value={stats.completedMontages.toString()}
          subtitle={t('dashboard.total')}
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
          trend={stats.completedTrend}
        />
        <StatCard
          title={t('dashboard.inventory_items')}
          value={stats.inventoryCount.toString()}
          subtitle={t('dashboard.low_stock_count', { count: stats.lowStockCount })}
          icon={Package}
          iconColor={stats.lowStockCount > 0 ? 'text-orange-500' : 'text-violet-500'}
          iconBg={stats.lowStockCount > 0 ? 'bg-orange-500/10' : 'bg-violet-500/10'}
          warning={stats.lowStockCount > 0}
        />
        <StatCard
          title={t('dashboard.team_members')}
          value={stats.employeeCount.toString()}
          subtitle={t('common.active')}
          icon={Users}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Revenue Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Revenue Chart — 2/3 width */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-foreground text-base">
                  {t('dashboard.revenue_overview', 'Revenue Overview')}
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold text-foreground">{totalMontagesInPeriod}</span>
                  {periodTrend !== 0 && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${periodTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {periodTrend >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />}
                      {periodTrend >= 0 ? '+' : ''}{periodTrend}% vs prev period
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['1month', '3months', '6months', '1year', '2years'] as TimePeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={timePeriod === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(p)}
                  className={`text-xs h-7 px-2 ${timePeriod === p ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {p === '1month' ? '1M' : p === '3months' ? '3M' : p === '6months' ? '6M' : p === '1year' ? '1Y' : '2Y'}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary row */}
            <div className="flex items-center gap-6 mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/10 rounded-md">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.total_revenue', 'Total Revenue')}</p>
                  <p className="text-base font-bold text-green-500">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
              {stats.revenueTrend !== 0 && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stats.revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.revenueTrend >= 0
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />}
                  {stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend}% this month
                </span>
              )}
            </div>
            {/* Chart */}
            <div className="h-55 sm:h-65">
              {revenueData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value, name) => {
                        if (name === 'revenue' && typeof value === 'number') return [formatCurrency(value), t('dashboard.revenue', 'Revenue')]
                        return [value, name]
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">{t('dashboard.no_revenue_data', 'No revenue data for this period')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity — 1/3 width */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                onClick={() => navigate('/montages')}
              >
                View All
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
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Montages Table */}
      {activeMontagesList.length > 0 && (
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4 text-primary" />
                Active Montages
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                onClick={() => navigate('/montages')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Client</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Location</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Date</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMontagesList.map((m) => {
                    const colorClass = getMontageStatusColor(m.status)
                    return (
                      <tr
                        key={m.id}
                        onClick={() => navigate(`/montages/${m.id}`)}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{m.client_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.client_city || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${colorClass}`}>
                            {getMontageStatusLabel(m.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(m.installation_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {m.total_price ? formatCurrency(m.total_price) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="sm:hidden space-y-2 p-4">
              {activeMontagesList.map((m) => {
                const colorClass = getMontageStatusColor(m.status)
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/montages/${m.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{m.client_name}</p>
                      <p className="text-xs text-muted-foreground">{m.client_city || '—'} · {new Date(m.installation_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
                        {getMontageStatusLabel(m.status)}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Grid — Maintenance & Inventory Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Maintenance Reminders */}
        <Card className="glass-card h-full">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              {t('dashboard.maintenance_reminders', 'Maintenance Reminders')}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('dashboard.maintenance_reminders_desc', 'Clients due for annual AC maintenance service')}
            </p>
          </CardHeader>
          <CardContent>
            {maintenanceReminders.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
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
                          {montage.client_phone || t('common.no_phone', 'No phone')} • {montage.client_city || 'N/A'}
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
                          ? t('dashboard.overdue_days', '{{days}} days overdue', { days: Math.abs(daysUntil) })
                          : daysUntil === 0
                            ? t('dashboard.due_today', 'Due today')
                            : t('dashboard.due_in_days', 'In {{days}} days', { days: daysUntil })
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <AlertTriangle className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm sm:text-base">{t('dashboard.no_maintenance_due', 'No maintenance due in the next 60 days')}</p>
                <p className="text-xs sm:text-sm mt-1">{t('dashboard.maintenance_auto_calc', 'Maintenance is calculated 1 year after installation')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inventory Activity */}
        <RecentInventoryActivity />
      </div>
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
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, warning = false }: StatCardProps) {
  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-300">
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
