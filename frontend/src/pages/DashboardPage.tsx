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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [montagesRes, inventoryRes, lowStockRes, employeesRes] = await Promise.all([
          montageService.getAll(1, 100),
          inventoryService.getAll(1, 1),
          inventoryService.getLowStock(1, 1),
          user?.roles.includes('Manager') ? employeeService.getAll() : Promise.resolve([])
        ])

        const active = montagesRes.items.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length
        const completed = montagesRes.items.filter(m => m.status === 'Completed').length

        setStats({
          activeMontages: active,
          completedMontages: completed,
          inventoryCount: inventoryRes.total_count,
          lowStockCount: lowStockRes.total_count,
          employeeCount: employeesRes.length
        })

      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      }
    }

    fetchStats()
  }, [user])

  return (
    <div className="min-h-screen bg-slate-950 p-8 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('common.dashboard')}</h1>
          <p className="text-gray-400">
            {t('common.welcome', { name: user?.first_name })}
            {user?.company_name && (
              <span className="text-purple-400"> • {user.company_name}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/montages')} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('montages.new_montage')}
          </Button>
        </div>
      </div>

      {/* Trial Warning */}
      {user?.subscription_plan === 'FreeTrial' && user.trial_end_date && (
        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-4">
          <div className="p-2 bg-purple-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{t('dashboard.free_trial_title')}</h3>
            <p className="text-gray-400 text-sm">
              {t('dashboard.free_trial_desc', { 
                date: new Date(user.trial_end_date).toLocaleDateString(),
                days: Math.ceil((new Date(user.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              })}
            </p>
          </div>
          <Button variant="outline" className="ml-auto border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-400" />
              {t('dashboard.recent_montages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm italic">{t('dashboard.latest_montages_placeholder')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              {t('dashboard.low_stock_alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <p className="text-gray-500 text-sm italic">{t('dashboard.view_full_inventory')}</p>
             </div>
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
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">{title}</p>
          <Icon className={`w-5 h-5 ${warning ? 'text-orange-400' : 'text-purple-400'}`} />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
        <p className={`text-sm ${warning ? 'text-orange-400' : 'text-green-400'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}
