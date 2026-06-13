import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Box,
  Users,
  Snowflake,
  Settings,
  Building2,
  AlertTriangle,
  LogOut,
  Bug,
  MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { AcIcon } from '@/components/AcIcon'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/mode-toggle'
import { SubscriptionExpiredModal } from '@/components/SubscriptionExpiredModal'
import { ReportProblemModal } from '@/components/ReportProblemModal'
import { getInitials } from '@/lib/avatar'

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
      if (!document.hidden) refreshUser()
    }
    const handleFocus = () => refreshUser()
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
      <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md border-b border-border/50 lg:hidden">
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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 glass-sidebar px-3 py-4 z-50 flex flex-col transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />

        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-3 right-3 lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent/80 transition-colors z-10"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div
          className="relative flex items-center gap-3 mb-6 px-1 cursor-pointer shrink-0 group z-10"
          onClick={() => navigate('/dashboard')}
        >
          <div className="relative w-9 h-9 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center
                            shadow-md shadow-primary/40 ring-1 ring-primary/30
                            group-hover:shadow-lg group-hover:shadow-primary/50
                            group-hover:ring-primary/50 transition-all duration-300">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-0 dark:opacity-100 pointer-events-none" />
          </div>
          <div className="min-w-0">
            <span className="text-sidebar-foreground font-bold text-base tracking-tight leading-tight block truncate">
              {t('app_name')}
            </span>
            <span className="text-muted-foreground/60 text-[10px] tracking-widest uppercase font-medium">
              AC Management
            </span>
          </div>
        </div>

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
              icon={Box}
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

          <div className="pt-3 mt-2">
            <div className="flex items-center gap-2 px-2 mb-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
              <p className="text-[10px] text-muted-foreground/40 font-semibold uppercase tracking-widest shrink-0">
                {t('nav.database', 'Database')}
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
            </div>
            <NavItem
              icon={Snowflake}
              label={t('nav.air_conditioners')}
              active={location.pathname === '/air-conditioners' || location.pathname.startsWith('/air-conditioners/')}
              onClick={() => handleNavClick('/air-conditioners')}
            />
            <NavItem
              icon={AlertTriangle}
              label={t('nav.error_codes', 'Error Codes')}
              active={location.pathname === '/error-codes'}
              onClick={() => handleNavClick('/error-codes')}
            />
          </div>

          {isAdmin && (
            <div className="pt-3 mt-2">
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
                <p className="text-[10px] text-muted-foreground/40 font-semibold uppercase tracking-widest shrink-0">
                  {t('nav.admin', 'Admin')}
                </p>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />
              </div>
              <NavItem
                icon={Building2}
                label={t('nav.companies', 'Companies')}
                active={location.pathname === '/companies'}
                onClick={() => handleNavClick('/companies')}
              />
              <NavItem
                icon={MessageSquare}
                label={t('nav.reported_problems', 'Reported Problems')}
                active={location.pathname === '/reported-problems'}
                onClick={() => handleNavClick('/reported-problems')}
              />
            </div>
          )}

          <div className="pt-3 mt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent mb-2" />
            <NavItem
              icon={Settings}
              label={t('common.settings')}
              active={location.pathname === '/settings'}
              onClick={() => handleNavClick('/settings')}
            />
          </div>
        </nav>

        <div className="mt-3 space-y-2 shrink-0">
          <div className="glass-card-elevated p-3 rounded-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-primary/30 to-primary/10 text-primary">
                    {user?.full_name ? getInitials(user.full_name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-sidebar" />
              </div>
              <div className="min-w-0">
                <p className="text-sidebar-foreground font-semibold text-sm truncate">{user?.full_name}</p>
                <p className="text-muted-foreground text-[11px] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {user?.roles.map(role => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="text-[10px] px-1.5 h-4 rounded font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {!isAdmin && (
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground
                         border border-border/50 hover:text-orange-500 hover:border-orange-500/40
                         hover:bg-orange-500/5 transition-all duration-200"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Bug className="w-3.5 h-3.5 shrink-0" />
              {t('problem_reports.report_problem')}
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <button
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground
                         hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {t('common.logout')}
            </button>
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </aside>

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
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: () => void
}

function NavItem({ icon: Icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all duration-200 group text-sm ${
        active
          ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/20 shadow-sm'
          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground border border-transparent hover:translate-x-0.5'
      }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-all duration-200 ${
          active
            ? 'text-primary'
            : 'group-hover:scale-110'
        }`}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={1.5}
      />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}
    </button>
  )
}
