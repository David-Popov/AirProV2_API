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
import { ModeToggle } from '@/components/mode-toggle'

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
    <div className="min-h-screen bg-background">
      {/* Sidebar - Glass Effect */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-sidebar p-4 z-50 flex flex-col transition-all duration-300">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/10">
            <Snowflake className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-bold text-xl tracking-tight">{t('app_name')}</span>
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
          <div className="pt-4 mt-4 border-t border-sidebar-border/50">
             <NavItem 
              icon={Settings} 
              label={t('common.settings')}
              active={location.pathname === '/settings'}
              onClick={() => handleNavClick('/settings')}
            />
          </div>
        </nav>

        <div className="mt-auto space-y-4">
          {/* User info */}
          <div className="p-3 bg-sidebar-accent/50 rounded-xl border border-sidebar-border/50 backdrop-blur-sm">
            <p className="text-sidebar-foreground font-medium text-sm truncate">{user?.full_name}</p>
            <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {user?.roles.map(role => (
                <Badge key={role} variant="secondary" className="text-[10px] px-2 h-5 rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="flex-1 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
            <ModeToggle />
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]' 
          : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium">{label}</span>
      </button>
  )
}
