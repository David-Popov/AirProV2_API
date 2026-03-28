import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ArrowRight, ClipboardList, Package, Users } from 'lucide-react'
import { AcIcon } from '@/components/AcIcon'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  activePage: 'login' | 'register'
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Same navbar as landing page */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AirPro</span>
          </Link>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t('auth.login_nav')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25">
                {t('auth.get_started')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left panel — hero image + marketing */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col text-white overflow-hidden">
          {/* Hero image */}
          <div className="absolute inset-0">
            <img
              src="/assets/auth-banner.jpg"
              alt="HVAC technician"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-end h-full p-12 pb-16">
            {/* Checkmark badge */}
            <div className="mb-8">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              {t('auth.hero_title')}
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg">
              {t('auth.hero_subtitle')}
            </p>

            {/* Feature badges */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                <span className="text-sm text-white/80">{t('auth.badge_montages')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm text-white/80">{t('auth.badge_inventory')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-white/80">{t('auth.badge_employees')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center overflow-y-auto bg-background">
          <div className="w-full max-w-lg px-6 py-10 sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
