import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Users, 
  Snowflake, 
  Settings, 
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4 z-50 flex flex-col">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">{t('app_name')}</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={LayoutDashboard} 
            label={t('nav.dashboard')}
            active={location.pathname === '/dashboard'}
            onClick={() => handleNavClick('/dashboard')} 
          />
          <NavItem 
            icon={ClipboardList} 
            label={t('nav.montages')}
            active={location.pathname === '/montages'}
            onClick={() => handleNavClick('/montages')} 
          />
          <NavItem 
            icon={Package} 
            label={t('nav.inventory')}
            active={location.pathname === '/inventory'}
            onClick={() => handleNavClick('/inventory')}
          />
          {user?.roles.includes('Manager') && (
            <NavItem 
              icon={Users} 
              label={t('nav.employees')}
              active={location.pathname === '/employees'}
              onClick={() => handleNavClick('/employees')}
            />
          )}
          <NavItem 
            icon={Snowflake} 
            label={t('nav.air_conditioners')}
            active={location.pathname === '/air-conditioners'}
            onClick={() => handleNavClick('/air-conditioners')}
          />
          <div className="pt-4 mt-4 border-t border-slate-800">
             <NavItem 
              icon={Settings} 
              label={t('common.settings')}
              active={location.pathname === '/settings'}
              onClick={() => handleNavClick('/settings')}
            />
          </div>
        </nav>

        <div className="mt-auto">
          {/* User info */}
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-white font-medium text-sm truncate">{user?.full_name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {user?.roles.map(role => (
                <Badge key={role} variant="secondary" className="text-[10px] px-1 h-5">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="flex-1 justify-start text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <Outlet />
    </div>
  )
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      </button>
  )
}
