import { Link, Navigate } from 'react-router-dom'
import {
  ClipboardList,
  Package,
  Users,
  ArrowRight,
  Shield,
  BarChart3,
  CheckCircle2,
  Bell,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/context'
import { AcIcon } from '@/components/AcIcon'
import { FloatingParticles } from '@/components/FloatingParticles'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function HomePage() {
  usePageTitle('HVAC Service Management')
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-60 -right-60 w-125 h-125 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-60 w-100 h-100 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-75 h-75 bg-violet-400/5 rounded-full blur-3xl" />
      </div>

      {/* Floating air particles */}
      <FloatingParticles />

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AirPro</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t('home.login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25">
                {t('home.get_started')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-primary">AirPro</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base shadow-lg shadow-primary/25 rounded-xl"
              >
                {t('home.create_account')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-12 text-base rounded-xl"
              >
                {t('home.sign_in')}
              </Button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {t('home.no_credit_card')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {t('home.setup_minutes')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {t('home.cancel_anytime')}
            </span>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-6 space-y-4">
            {/* Mock header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-32 bg-muted rounded-md" />
                <div className="h-3.5 w-48 bg-muted/60 rounded-md mt-1.5" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Dashboard
              </Badge>
            </div>
            {/* Mock stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active Jobs', val: '12', trend: '+5%', color: 'text-primary', bg: 'bg-primary/10', trendColor: 'text-green-500' },
                { label: 'Completed', val: '84', trend: '+12%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', trendColor: 'text-green-500' },
                { label: 'Inventory', val: '247', trend: '+2%', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', trendColor: 'text-amber-500' },
                { label: 'Team', val: '6', trend: 'Active', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', trendColor: 'text-green-500' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-border/50`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <span className={`text-[10px] font-medium ${s.trendColor}`}>{s.trend}</span>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            {/* Mock table row */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/30 px-4 py-2.5 flex items-center gap-4 text-xs font-medium text-muted-foreground border-b border-border">
                <span className="flex-1">Client</span>
                <span className="w-24 hidden sm:block">Date</span>
                <span className="w-20">Status</span>
                <span className="w-16 text-right">Price</span>
              </div>
              {[
                { name: 'Stefan Petrov', date: '19 Feb', status: 'Completed', price: '€480', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                { name: 'Maria Georgieva', date: '21 Feb', status: 'Planned', price: '€350', color: 'bg-primary/10 text-primary' },
                { name: 'Ivan Dimitrov', date: '22 Feb', status: 'In Progress', price: '€520', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
              ].map((row) => (
                <div key={row.name} className="px-4 py-3 flex items-center gap-4 text-sm border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <span className="flex-1 font-medium text-foreground truncate">{row.name}</span>
                  <span className="w-24 text-muted-foreground hidden sm:block">{row.date}</span>
                  <span className={`w-20 text-xs font-medium px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                  <span className="w-16 text-right font-semibold text-foreground">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {t('home.features_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('home.features_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={ClipboardList}
            title={t('home.feature_montage_title')}
            description={t('home.feature_montage_desc')}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <FeatureCard
            icon={Package}
            title={t('home.feature_inventory_title')}
            description={t('home.feature_inventory_desc')}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <FeatureCard
            icon={Users}
            title={t('home.feature_team_title')}
            description={t('home.feature_team_desc')}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <FeatureCard
            icon={BarChart3}
            title={t('home.feature_analytics_title')}
            description={t('home.feature_analytics_desc')}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <FeatureCard
            icon={Bell}
            title={t('home.feature_reminders_title')}
            description={t('home.feature_reminders_desc')}
            iconBg="bg-rose-500/10"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <FeatureCard
            icon={Shield}
            title={t('home.feature_security_title')}
            description={t('home.feature_security_desc')}
            iconBg="bg-sky-500/10"
            iconColor="text-sky-600 dark:text-sky-400"
          />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 py-20 lg:py-28 border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {t('landing.pricing_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('landing.pricing_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-7 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-1">{t('landing.plan_free')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('landing.plan_free_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">€0</span>
              <span className="text-muted-foreground ml-1">/ {t('landing.month')}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <PricingFeature included>{t('landing.feature_2_employees')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_unlimited_montages')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_inventory')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_ac_database')}</PricingFeature>
              <PricingFeature>{t('landing.feature_unlimited_employees')}</PricingFeature>
              <PricingFeature>{t('landing.feature_priority_support')}</PricingFeature>
            </ul>
            <Link to="/register">
              <Button variant="outline" className="w-full h-11 rounded-xl">
                {t('landing.get_started_free')}
              </Button>
            </Link>
          </div>

          {/* Free Trial */}
          <div className="bg-card border-2 border-primary rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold shadow-md shadow-primary/25">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('landing.recommended')}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{t('landing.plan_trial')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('landing.plan_trial_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">€0</span>
              <span className="text-muted-foreground ml-1">/ {t('landing.six_months')}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <PricingFeature included>{t('landing.feature_unlimited_employees')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_unlimited_montages')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_inventory')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_ac_database')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_analytics')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_no_card')}</PricingFeature>
            </ul>
            <Link to="/register">
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25">
                {t('landing.start_trial')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-card border border-border rounded-2xl p-7 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-1">{t('landing.plan_premium')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('landing.plan_premium_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">€4.99</span>
              <span className="text-muted-foreground ml-1">/ {t('landing.month')}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <PricingFeature included>{t('landing.feature_unlimited_employees')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_unlimited_montages')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_inventory')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_ac_database')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_analytics')}</PricingFeature>
              <PricingFeature included>{t('landing.feature_priority_support')}</PricingFeature>
            </ul>
            <Link to="/register">
              <Button variant="outline" className="w-full h-11 rounded-xl">
                {t('landing.get_started_free')}
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('landing.pricing_note')}
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="bg-primary rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
              {t('home.cta_title')}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              {t('home.cta_subtitle')}
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-10 h-12 rounded-xl shadow-lg text-base"
              >
                {t('home.cta_button')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <AcIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© {new Date().getFullYear()} AirPro. {t('public.copyright')}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('public.privacy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('public.terms')}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{t('public.contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  iconBg: string
  iconColor: string
}

function FeatureCard({ icon: Icon, title, description, iconBg, iconColor }: FeatureCardProps) {
  return (
    <div className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function PricingFeature({ children, included }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground/60'}>{children}</span>
    </li>
  )
}
