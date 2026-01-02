import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ClipboardList, 
  Package, 
  Users, 
  Plus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context'
import { inventoryService, montageService, employeeService } from '@/services'
import type { Montage } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    activeMontages: 0,
    completedMontages: 0,
    inventoryCount: 0,
    lowStockCount: 0,
    employeeCount: 0
  })

  const [upcomingMontages, setUpcomingMontages] = useState<Montage[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [montagesRes, inventoryRes, lowStockRes, employeesRes] = await Promise.all([
          montageService.getAll(1, 1000), // Get enough data to filter
          inventoryService.getAll(1, 1),
          inventoryService.getLowStock(1, 1),
          user?.roles.includes('Manager') ? employeeService.getAll() : Promise.resolve([])
        ])

        const montages = montagesRes.items
        const active = montages.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length
        const completed = montages.filter(m => m.status === 'Completed').length

        // Filter upcoming: Status is Planned/Scheduled and date is today or future
        const today = new Date()
        today.setHours(0,0,0,0)
        
        const upcoming = montages
          .filter(m => 
            (m.status === 'Planned' || m.status === 'Scheduled') && 
            new Date(m.installation_date) >= today
          )
          .sort((a, b) => new Date(a.installation_date).getTime() - new Date(b.installation_date).getTime())
          .slice(0, 5)

        setUpcomingMontages(upcoming)
        setStats({
          activeMontages: active,
          completedMontages: completed,
          inventoryCount: inventoryRes.totalCount,
          lowStockCount: lowStockRes.totalCount,
          employeeCount: employeesRes.length
        })

      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      }
    }

    fetchStats()
  }, [user])

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

      {/* Trial Warning */}
      {user?.subscription_plan === 'FreeTrial' && user.trial_end_date && (
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
          <Button variant="outline" className="ml-auto border-primary/50 text-primary hover:bg-primary/10">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Maintenance / Planned Montages */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {t('dashboard.upcoming_maintenance', 'Upcoming Maintenance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMontages.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMontages.map(montage => (
                    <div 
                      key={montage.id} 
                      onClick={() => navigate(`/montages`)}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{montage.client_name}</p>
                        <p className="text-sm text-muted-foreground">{montage.client_city || 'City N/A'} • {montage.client_address || 'Address N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {new Date(montage.installation_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {montage.air_conditioner?.brand || 'AC'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('dashboard.no_upcoming_maintenance', 'No upcoming maintenance scheduled')}
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
