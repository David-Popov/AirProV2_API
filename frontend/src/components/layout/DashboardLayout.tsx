import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Snowflake,
  Settings,
  LogOut,
  AlertCircle,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/mode-toggle'
import { SubscriptionExpiredModal } from '@/components/SubscriptionExpiredModal'

export default function DashboardLayout() {
  const { user, logout, refreshUser } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUser()
      }
    }

    const handleFocus = () => {
      refreshUser()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshUser])

  const isAdmin = user?.roles.includes('Admin')
  const isManager = user?.roles.includes('Manager')
  
  const isSubscriptionExpired = !isAdmin && (
    user?.subscription_status === 'Expired' || 
    user?.subscription_status === 'Cancelled' ||
    (user?.subscription_status === 'Trial' && user?.trial_end_date && new Date(user.trial_end_date) < new Date())
  )

  const handleNavClick = (path: string) => {
    navigate(path)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button - Top Right */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glass Effect */}
      <aside className={`fixed left-0 top-0 h-full w-64 glass-sidebar p-4 z-50 flex flex-col transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/10">
            <Snowflake className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-bold text-xl tracking-tight">{t('app_name')}</span>
        </div>

        <nav className="space-y-2 flex-1">
          {/* Main Navigation */}
          {/* Dashboard - Only for Manager */}
          {isManager && !isAdmin && (
            <NavItem 
              icon={LayoutDashboard} 
              label={t('nav.dashboard')}
              active={location.pathname === '/dashboard'}
              onClick={() => handleNavClick('/dashboard')} 
            />
          )}
          <NavItem 
            icon={ClipboardList} 
            label={t('nav.montages')}
            active={location.pathname === '/montages' || location.pathname.startsWith('/montages/')}
            onClick={() => handleNavClick('/montages')} 
          />
          {/* Inventory - Hidden from Admin */}
          {!isAdmin && (
            <NavItem 
              icon={Package} 
              label={t('nav.inventory')}
              active={location.pathname === '/inventory'}
              onClick={() => handleNavClick('/inventory')}
            />
          )}
          
          {/* Employee Management - Managers and Admins */}
          {(isManager || isAdmin) && (
            <NavItem 
              icon={Users} 
              label={t('nav.employees')}
              active={location.pathname === '/employees'}
              onClick={() => handleNavClick('/employees')}
            />
          )}
          
          {/* AC Database Section */}
          <div className="pt-3 mt-3 border-t border-sidebar-border/50">
            <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {t('nav.database', 'Database')}
            </p>
            <NavItem 
              icon={Snowflake} 
              label={t('nav.air_conditioners')}
              active={location.pathname === '/air-conditioners' || location.pathname.startsWith('/air-conditioners/')}
              onClick={() => handleNavClick('/air-conditioners')}
            />
            <NavItem 
              icon={AlertCircle} 
              label={t('nav.error_codes', 'Error Codes')}
              active={location.pathname === '/error-codes'}
              onClick={() => handleNavClick('/error-codes')}
            />
          </div>
          
          {/* Admin Section */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-sidebar-border/50">
              <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {t('nav.admin', 'Admin')}
              </p>
              <NavItem 
                icon={Building2} 
                label={t('nav.companies', 'Companies')}
                active={location.pathname === '/companies'}
                onClick={() => handleNavClick('/companies')}
              />
            </div>
          )}
          
          {/* Settings */}
          <div className="pt-3 mt-3 border-t border-sidebar-border/50">
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
      
      {/* Subscription Expired Modal */}
      <SubscriptionExpiredModal isOpen={!!isSubscriptionExpired} />
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

