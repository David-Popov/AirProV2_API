import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardList,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function DashboardPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6months')

  // Fetch data with React Query (cached, parallel)
  const { data: montagesData, isLoading: isLoadingMontages } = useMontages(1, 100)
  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory(1, 100)
  const { data: employeesData } = useEmployees()

  const allMontages = montagesData?.items ?? []

  // Compute stats from cached data
  const stats = useMemo(() => {
    const activeMontages = allMontages.filter(m =>
      m.status === 'InProgress' || m.status === 'Planned'
    ).length
    const completedMontages = allMontages.filter(m => m.status === 'Completed').length
    const inventoryCount = inventoryData?.totalCount ?? 0
    const lowStockCount = inventoryData?.items.filter(item => item.is_low_stock).length ?? 0
    const employeeCount = user?.roles.includes('Manager') ? (employeesData?.length ?? 0) : 0

    return { activeMontages, completedMontages, inventoryCount, lowStockCount, employeeCount }
  }, [allMontages, inventoryData, employeesData, user])

  // Compute maintenance reminders from montage data
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

  // Calculate revenue data based on selected time period
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

  const totalRevenue = useMemo(() => {
    return revenueData.reduce((sum, d) => sum + d.revenue, 0)
  }, [revenueData])

  const totalMontagesInPeriod = useMemo(() => {
    return revenueData.reduce((sum, d) => sum + d.count, 0)
  }, [revenueData])

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


      {/* Trial Warning - Only show if user is on FreeTrial AND not Premium */}
      {user?.subscription_plan === 'FreeTrial' && user?.subscription_status === 'Trial' && user.trial_end_date && (
        <div className="mb-6 sm:mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="p-2 bg-primary/20 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium">{t('dashboard.free_trial_title')}</h3>
            <p className="text-muted-foreground text-sm break-words">
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

      {/* Revenue Chart */}
      <Card className="glass-card mb-6 sm:mb-8">
        <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-2 gap-4">          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-foreground">
                {t('dashboard.revenue_overview', 'Revenue Overview')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.completed_montages_revenue', 'Revenue from completed montages')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <Button 
              variant={timePeriod === '1month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimePeriod('1month')}
              className={timePeriod === '1month' ? 'bg-primary text-primary-foreground' : ''}
            >
              {t('dashboard.1_month', '1 Month')}
            </Button>
            <Button 
              variant={timePeriod === '3months' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimePeriod('3months')}
              className={timePeriod === '3months' ? 'bg-primary text-primary-foreground' : ''}
            >
              {t('dashboard.3_months', '3 Months')}
            </Button>
            <Button 
              variant={timePeriod === '6months' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimePeriod('6months')}
              className={timePeriod === '6months' ? 'bg-primary text-primary-foreground' : ''}
            >
              {t('dashboard.6_months', '6 Months')}
            </Button>
            <Button 
              variant={timePeriod === '1year' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimePeriod('1year')}
              className={timePeriod === '1year' ? 'bg-primary text-primary-foreground' : ''}
            >
              {t('dashboard.1_year', '1 Year')}
            </Button>
            <Button 
              variant={timePeriod === '2years' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimePeriod('2years')}
              className={timePeriod === '2years' ? 'bg-primary text-primary-foreground' : ''}
            >
              {t('dashboard.2_years', '2 Years')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <div className="p-3 bg-green-500/10 rounded-full">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.total_revenue', 'Total Revenue')}</p>
                <p className="text-2xl font-bold text-green-500">
                  €{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="p-3 bg-primary/10 rounded-full">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.montages_completed', 'Montages Completed')}</p>
                <p className="text-2xl font-bold text-primary">{totalMontagesInPeriod}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[250px] sm:h-[300px] mt-4">
            {revenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `€${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    formatter={(value, name) => {
                      if (name === 'revenue' && typeof value === 'number') {
                        return [`€${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, t('dashboard.revenue', 'Revenue')]
                      }
                      return [value, name]
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p>{t('dashboard.no_revenue_data', 'No revenue data for this period')}</p>
                <p className="text-sm mt-1">{t('dashboard.complete_montages_hint', 'Complete montages to see revenue statistics')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard 
          title={t('dashboard.active_montages')} 
          value={stats.activeMontages.toString()} 
          change={t('dashboard.current')} 
          icon={ClipboardList}
        />
        <StatCard 
          title={t('dashboard.completed_montages')} 
          value={stats.completedMontages.toString()} 
          change={t('dashboard.total')} 
          icon={TrendingUp}
        />
        <StatCard 
          title={t('dashboard.inventory_items')} 
          value={stats.inventoryCount.toString()} 
          change={t('dashboard.low_stock_count', { count: stats.lowStockCount })}
          icon={Package}
          warning={stats.lowStockCount > 0}
        />
        <StatCard 
          title={t('dashboard.team_members')} 
          value={stats.employeeCount.toString()} 
          change={t('common.active')} 
          icon={Users}
        />
      </div>

      {/* Bottom Grid - Maintenance & Inventory Activity */}
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
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  warning?: boolean;
}

function StatCard({ title, value, change, icon: Icon, warning = false }: StatCardProps) {
  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate pr-2">{title}</p>
          <div className={`p-2 rounded-lg shrink-0 ${warning ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${warning ? 'text-orange-500' : 'text-primary'}`} />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">{value}</p>
        <p className={`text-xs sm:text-sm ${warning ? 'text-orange-500 font-medium' : 'text-green-500'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
