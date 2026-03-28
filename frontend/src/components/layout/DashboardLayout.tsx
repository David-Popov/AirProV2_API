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

import { AcIcon } from '@/components/AcIcon'
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
      {/* Mobile Top Bar */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md border-b border-border lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-accent transition-colors touch-target-sm"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shadow-sm shadow-primary/30">
            <AcIcon className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-foreground">{t('app_name')}</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-60 glass-sidebar px-3 py-4 z-50 flex flex-col transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button — mobile only */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-3 right-3 lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent/80 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Logo */}
        <div
          className="flex items-center gap-3 mb-6 px-1 cursor-pointer shrink-0 group"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0
                          shadow-md shadow-primary/30 ring-1 ring-primary/20
                          group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-200">
            <AcIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <span className="text-sidebar-foreground font-semibold text-base tracking-tight leading-tight block truncate">
              {t('app_name')}
            </span>
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              AC Management
            </span>
          </div>
        </div>

        {/* Nav — scrollable */}
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
          <div className="pt-3 mt-2 border-t border-sidebar-border/50">
            <p className="px-3 text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-widest mb-2">
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
            <div className="pt-3 mt-2 border-t border-sidebar-border/50">
              <p className="px-3 text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-widest mb-2">
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
          <div className="pt-3 mt-2 border-t border-sidebar-border/50">
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
          <div className="p-3 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/30
                          backdrop-blur-sm transition-colors hover:bg-sidebar-accent/50">
            <div className="flex items-center gap-2.5 mb-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/20 text-primary">
                  {user?.full_name ? getInitials(user.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sidebar-foreground font-medium text-sm truncate">{user?.full_name}</p>
                <p className="text-muted-foreground text-[11px] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {user?.roles.map(role => (
                <Badge key={role} variant="secondary" className="text-[10px] px-1.5 h-4 rounded font-medium bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80">
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
      className={`w-full flex items-center gap-2.5 py-2 rounded-lg transition-all duration-200 group text-sm
        border-l-2 pl-[10px] pr-3 ${
        active
          ? 'bg-primary/10 text-primary font-semibold border-primary'
          : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="truncate">{label}</span>
    </button>
  )
}
