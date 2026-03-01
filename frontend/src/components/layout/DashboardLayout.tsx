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
  X,
  Bug,
  MessageSquareWarning
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/mode-toggle'
import { SubscriptionExpiredModal } from '@/components/SubscriptionExpiredModal'
import { ReportProblemModal } from '@/components/ReportProblemModal'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

export default function DashboardLayout() {
  const { user, logout, refreshUser } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

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
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Menu className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-60 glass-sidebar px-3 py-4 z-50 flex flex-col transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4 px-1 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/25 ring-1 ring-white/10 shrink-0">
            <Snowflake className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-semibold text-base tracking-tight">{t('app_name')}</span>
        </div>

        {/* Nav — scrollable so items never push bottom section off-screen */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 min-h-0 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">
          {isManager && !isAdmin && (
            <NavItem
              icon={LayoutDashboard}
              label={t('nav.dashboard')}
              active={location.pathname === '/dashboard'}
              onClick={() => handleNavClick('/dashboard')}
            />
          )}
          {!isAdmin && (
            <NavItem
              icon={ClipboardList}
              label={t('nav.montages')}
              active={location.pathname === '/montages' || location.pathname.startsWith('/montages/')}
              onClick={() => handleNavClick('/montages')}
            />
          )}
          {!isAdmin && (
            <NavItem
              icon={Package}
              label={t('nav.inventory')}
              active={location.pathname === '/inventory'}
              onClick={() => handleNavClick('/inventory')}
            />
          )}
          {isManager && !isAdmin && (
            <NavItem
              icon={Users}
              label={t('nav.employees')}
              active={location.pathname === '/employees'}
              onClick={() => handleNavClick('/employees')}
            />
          )}

          {/* Database section */}
          <div className="pt-2 mt-2 border-t border-sidebar-border/50">
            <p className="px-3 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
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

          {/* Admin section */}
          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-sidebar-border/50">
              <p className="px-3 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('nav.admin', 'Admin')}
              </p>
              <NavItem
                icon={Building2}
                label={t('nav.companies', 'Companies')}
                active={location.pathname === '/companies'}
                onClick={() => handleNavClick('/companies')}
              />
              <NavItem
                icon={MessageSquareWarning}
                label={t('nav.reported_problems', 'Reported Problems')}
                active={location.pathname === '/reported-problems'}
                onClick={() => handleNavClick('/reported-problems')}
              />
            </div>
          )}

          {/* Settings */}
          <div className="pt-2 mt-2 border-t border-sidebar-border/50">
            <NavItem
              icon={Settings}
              label={t('common.settings')}
              active={location.pathname === '/settings'}
              onClick={() => handleNavClick('/settings')}
            />
          </div>
        </nav>

        {/* Bottom section — always visible */}
        <div className="mt-3 space-y-2 shrink-0">
          {/* User info */}
          <div className="p-2.5 bg-sidebar-accent/50 rounded-lg border border-sidebar-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[10px] font-semibold bg-primary/20 text-primary">
                  {user?.full_name ? getInitials(user.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sidebar-foreground font-medium text-xs truncate">{user?.full_name}</p>
                <p className="text-muted-foreground text-[11px] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {user?.roles.map(role => (
                <Badge key={role} variant="secondary" className="text-[10px] px-1.5 h-4 rounded bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Report Problem */}
          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-orange-500 hover:border-orange-500/50 rounded-lg h-8 text-xs"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Bug className="w-3.5 h-3.5 mr-2 shrink-0" />
              {t('problem_reports.report_problem')}
            </Button>
          )}

          {/* Logout + theme + language */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 mr-2 shrink-0" />
              {t('common.logout')}
            </Button>
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <Outlet />

      <SubscriptionExpiredModal isOpen={!!isSubscriptionExpired} />

      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
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
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group text-sm ${
        active
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]'
          : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium truncate">{label}</span>
    </button>
  )
}
