import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ClipboardList, 
  Package, 
  Users, 
  Plus,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context'
import { inventoryService, montageService, employeeService } from '@/services'
import type { Montage } from '@/types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

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

  const [stats, setStats] = useState({
    activeMontages: 0,
    completedMontages: 0,
    inventoryCount: 0,
    lowStockCount: 0,
    employeeCount: 0
  })

  const [maintenanceReminders, setMaintenanceReminders] = useState<{
    montage: Montage
    maintenanceDate: Date
    daysUntil: number
    isOverdue: boolean
  }[]>([])
  const [allMontages, setAllMontages] = useState<Montage[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6months')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch montages with max allowed page size
        const montagesRes = await montageService.getAll(1, 100)
        const montages = montagesRes.items
        setAllMontages(montages)
        
        // Fix status matching - backend returns 'InProgress', 'Planned', 'Completed', etc.
        const active = montages.filter(m => 
          m.status === 'InProgress' || m.status === 'Planned'
        ).length
        const completed = montages.filter(m => m.status === 'Completed').length

        // Calculate maintenance reminders for COMPLETED installations
        // Maintenance is due 1 year after installation
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const reminders = montages
          .filter(m => m.status === 'Completed' || m.payment_status === 'Paid')
          .map(m => {
            // Calculate maintenance date: 1 year after completion (or installation if no completion date)
            const installDate = new Date(m.completion_date || m.installation_date)
            const maintenanceDate = new Date(installDate)
            maintenanceDate.setFullYear(maintenanceDate.getFullYear() + 1)
            
            const timeDiff = maintenanceDate.getTime() - today.getTime()
            const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
            
            return {
              montage: m,
              maintenanceDate,
              daysUntil,
              isOverdue: daysUntil < 0
            }
          })
          // Show maintenance due within next 60 days OR overdue (past due)
          .filter(r => r.daysUntil <= 60)
          // Sort by date (overdue first, then soonest)
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5)

        setMaintenanceReminders(reminders)

        // Fetch inventory - handle potential errors gracefully
        let inventoryCount = 0
        let lowStockCount = 0
        try {
          const inventoryRes = await inventoryService.getAll(1, 1)
          inventoryCount = inventoryRes.totalCount
          // Low stock items - filter from full list since endpoint may not exist
          const allInventory = await inventoryService.getAll(1, 100)
          lowStockCount = allInventory.items.filter(item => item.is_low_stock).length
        } catch (err) {
          console.warn('Failed to fetch inventory stats', err)
        }

        // Fetch employees if manager
        let employeeCount = 0
        try {
          if (user?.roles.includes('Manager')) {
            const employeesRes = await employeeService.getAll()
            employeeCount = employeesRes.length
          }
        } catch (err) {
          console.warn('Failed to fetch employee stats', err)
        }

        setStats({
          activeMontages: active,
          completedMontages: completed,
          inventoryCount,
          lowStockCount,
          employeeCount
        })

      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      }
    }

    fetchStats()
  }, [user])

  // Calculate revenue data based on selected time period
  const revenueData = useMemo((): RevenueDataPoint[] => {
    const now = new Date()
    let monthsBack = 6
    if (timePeriod === '1month') monthsBack = 1
    if (timePeriod === '3months') monthsBack = 3
    if (timePeriod === '1year') monthsBack = 12
    if (timePeriod === '2years') monthsBack = 24

    const data: RevenueDataPoint[] = []
    
    // Debug: log all montages and their statuses
    console.log('All montages for revenue:', allMontages.map(m => ({
      id: m.id,
      status: m.status,
      payment_status: m.payment_status,
      completion_date: m.completion_date,
      installation_date: m.installation_date,
      paid_amount: m.paid_amount,
      total_price: m.total_price
    })))
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      
      // Get montages for this month - count completed OR paid montages
      const monthMontages = allMontages.filter(m => {
        // Consider montage for revenue if it's Completed OR has payment status "Paid"
        const isCompleted = m.status === 'Completed'
        const isPaid = m.payment_status === 'Paid'
        
        if (!isCompleted && !isPaid) return false
        
        // Use completion_date if available, otherwise installation_date
        const dateStr = m.completion_date || m.installation_date
        if (!dateStr) return false
        
        const montageDate = new Date(dateStr)
        const montageYear = montageDate.getFullYear()
        const montageMonth = montageDate.getMonth()
        
        return montageYear === year && montageMonth === month
      })

      const revenue = monthMontages.reduce((sum, m) => sum + (m.paid_amount || m.total_price || 0), 0)
      
      // Format month name - for 1 month view, show full month name
      const monthName = date.toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : 'en-US', { 
        month: monthsBack <= 3 ? 'long' : 'short',
        year: monthsBack > 12 ? '2-digit' : undefined
      })

      data.push({
        month: monthName,
        revenue,
        count: monthMontages.length
      })
      
      console.log(`Month ${monthName}: ${monthMontages.length} montages, €${revenue}`)
    }

    return data
  }, [allMontages, timePeriod, i18n.language])

  // Calculate total revenue for the period
  const totalRevenue = useMemo(() => {
    return revenueData.reduce((sum, d) => sum + d.revenue, 0)
  }, [revenueData])

  const totalMontagesInPeriod = useMemo(() => {
    return revenueData.reduce((sum, d) => sum + d.count, 0)
  }, [revenueData])

  return (
    <div className="min-h-screen bg-background p-8 ml-64 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('common.dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('common.welcome', { name: user?.first_name })}
            {user?.company_name && (
              <span className="text-primary font-medium"> • {user.company_name}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/montages')} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            {t('montages.new_montage')}
          </Button>
        </div>
      </div>


      {/* Trial Warning - Only show if user is on FreeTrial AND not Premium */}
      {user?.subscription_plan === 'FreeTrial' && user?.subscription_status === 'Trial' && user.trial_end_date && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-4">
          <div className="p-2 bg-primary/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-medium">{t('dashboard.free_trial_title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('dashboard.free_trial_desc', { 
                date: new Date(user.trial_end_date).toLocaleDateString(),
                days: Math.ceil((new Date(user.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              })}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="ml-auto border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => navigate('/settings?tab=subscription')}
          >
            {t('dashboard.upgrade_plan')}
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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

      {/* Revenue Chart */}
      <Card className="glass-card mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="grid grid-cols-2 gap-6 mb-6">
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
          <div className="h-[300px] mt-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Maintenance Reminders - Due for annual service */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {t('dashboard.maintenance_reminders', 'Maintenance Reminders')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.maintenance_reminders_desc', 'Clients due for annual AC maintenance service')}
              </p>
            </CardHeader>
            <CardContent>
              {maintenanceReminders.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceReminders.map(({ montage, maintenanceDate, daysUntil, isOverdue }) => (
                    <div 
                      key={montage.id} 
                      onClick={() => navigate(`/montages/${montage.id}`)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isOverdue 
                          ? 'border-red-500/50 bg-red-500/5 hover:border-red-500' 
                          : daysUntil <= 14 
                            ? 'border-orange-500/50 bg-orange-500/5 hover:border-orange-500'
                            : 'border-border bg-background/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          isOverdue ? 'bg-red-500/10' : daysUntil <= 14 ? 'bg-orange-500/10' : 'bg-primary/10'
                        }`}>
                          <Phone className={`w-4 h-4 ${
                            isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{montage.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {montage.client_phone || t('common.no_phone', 'No phone')} • {montage.client_city || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
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
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>{t('dashboard.no_maintenance_due', 'No maintenance due in the next 60 days')}</p>
                  <p className="text-sm mt-1">{t('dashboard.maintenance_auto_calc', 'Maintenance is calculated 1 year after installation')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (Moved here for layout balance) */}
        <Card className="glass-card h-full">
          <CardHeader>
             <CardTitle className="text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                {t('dashboard.quick_actions', 'Quick Actions')}
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full justify-start h-12 text-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate('/montages')}>
                <Plus className="w-4 h-4 mr-3" /> {t('montages.new_montage')}
             </Button>
             <Button variant="outline" className="w-full justify-start h-12 text-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate('/air-conditioners')}>
                <Package className="w-4 h-4 mr-3" /> {t('air_conditioners.add_ac')}
             </Button>
             <Button variant="outline" className="w-full justify-start h-12 text-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate('/inventory')}>
                <ClipboardList className="w-4 h-4 mr-3" /> {t('inventory.add_item')}
             </Button>
          </CardContent>
        </Card>
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
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className={`p-2 rounded-lg ${warning ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
            <Icon className={`w-5 h-5 ${warning ? 'text-orange-500' : 'text-primary'}`} />
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">{value}</p>
        <p className={`text-sm ${warning ? 'text-orange-500 font-medium' : 'text-green-500'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
