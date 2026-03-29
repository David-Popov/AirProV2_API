import { Link, Navigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import {
  ClipboardText,
  Cube,
  UsersThree,
  ChartBar,
  Bell,
  ShieldCheck,
  ArrowRight,
  Sparkle,
  type IconWeight,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/context'
import { AcIcon } from '@/components/AcIcon'
import { FloatingParticles } from '@/components/FloatingParticles'
import { usePageTitle } from '@/hooks/usePageTitle'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, type: "tween" as const },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
} as const

export default function HomePage() {
  usePageTitle('HVAC Service Management')
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute -top-60 -right-60 w-125 h-125 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, type: "tween" as const }}
        />
        <motion.div
          className="absolute top-1/3 -left-60 w-100 h-100 bg-primary/7 rounded-full blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, type: "tween" as const, delay: 3 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-75 h-75 bg-violet-500/6 rounded-full blur-3xl"
          animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, type: "tween" as const, delay: 6 }}
        />
      </div>

      <FloatingParticles />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30 relative">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-0 dark:opacity-100 pointer-events-none" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">AirPro</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LanguageSwitcher />
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t('home.login')}
              </Button>
            </Link>
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25">
                  {t('home.get_started')}
                  <ArrowRight className="w-4 h-4 ml-1.5" weight="bold" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0.1)}>
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 bg-primary/5 text-primary text-xs px-3 py-1 rounded-full"
            >
              <Sparkle className="w-3 h-3 mr-1.5" weight="duotone" />
              HVAC Service Management Platform
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight"
            {...fadeUp(0.2)}
          >
            <span className="text-gradient">AirPro</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            {...fadeUp(0.3)}
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            {...fadeUp(0.4)}
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base shadow-lg shadow-primary/25 rounded-xl"
                >
                  {t('home.create_account')}
                  <ArrowRight className="w-5 h-5 ml-2" weight="bold" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-xl">
                  {t('home.sign_in')}
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-muted-foreground"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {[
              t('home.no_credit_card'),
              t('home.setup_minutes'),
              t('home.cancel_anytime'),
            ].map((item) => (
              <motion.span key={item} variants={staggerItem} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview mockup */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "tween" as const, delay: 0.5 }}
          whileHover={{ rotateX: 1.5, rotateY: -1.5, scale: 1.01 }}
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        >
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 p-6 space-y-4 ring-1 ring-primary/10 glow-sm dark:glow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-32 bg-muted rounded-md" />
                <div className="h-3.5 w-48 bg-muted/60 rounded-md mt-1.5" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Dashboard
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active Jobs', val: '12', trend: '+5%', color: 'text-primary', bg: 'from-primary/20 to-primary/5', trendColor: 'text-green-500' },
                { label: 'Completed', val: '84', trend: '+12%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', trendColor: 'text-green-500' },
                { label: 'Inventory', val: '247', trend: '+2%', color: 'text-violet-600 dark:text-violet-400', bg: 'from-violet-500/20 to-violet-500/5', trendColor: 'text-amber-500' },
                { label: 'Team', val: '6', trend: 'Active', color: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', trendColor: 'text-green-500' },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-3 border border-border/40`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <span className={`text-[10px] font-medium ${s.trendColor}`}>{s.trend}</span>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="bg-muted/30 px-4 py-2.5 flex items-center gap-4 text-xs font-medium text-muted-foreground border-b border-border/50">
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
                <div key={row.name} className="px-4 py-3 flex items-center gap-4 text-sm border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <span className="flex-1 font-medium text-foreground truncate">{row.name}</span>
                  <span className="w-24 text-muted-foreground hidden sm:block">{row.date}</span>
                  <span className={`w-20 text-xs font-medium px-2 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                  <span className="w-16 text-right font-semibold text-foreground">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {t('home.features_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('home.features_subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <FeatureCard icon={ClipboardText} title={t('home.feature_montage_title')} description={t('home.feature_montage_desc')} iconBg="from-primary/20 to-primary/5" iconColor="text-primary" />
          <FeatureCard icon={Cube} title={t('home.feature_inventory_title')} description={t('home.feature_inventory_desc')} iconBg="from-emerald-500/20 to-emerald-500/5" iconColor="text-emerald-600 dark:text-emerald-400" />
          <FeatureCard icon={UsersThree} title={t('home.feature_team_title')} description={t('home.feature_team_desc')} iconBg="from-violet-500/20 to-violet-500/5" iconColor="text-violet-600 dark:text-violet-400" />
          <FeatureCard icon={ChartBar} title={t('home.feature_analytics_title')} description={t('home.feature_analytics_desc')} iconBg="from-amber-500/20 to-amber-500/5" iconColor="text-amber-600 dark:text-amber-400" />
          <FeatureCard icon={Bell} title={t('home.feature_reminders_title')} description={t('home.feature_reminders_desc')} iconBg="from-rose-500/20 to-rose-500/5" iconColor="text-rose-600 dark:text-rose-400" />
          <FeatureCard icon={ShieldCheck} title={t('home.feature_security_title')} description={t('home.feature_security_desc')} iconBg="from-sky-500/20 to-sky-500/5" iconColor="text-sky-600 dark:text-sky-400" />
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 py-20 lg:py-28 border-t border-border/50">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {t('landing.pricing_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('landing.pricing_subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Free Plan */}
          <motion.div variants={staggerItem} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-7 flex flex-col hover:border-primary/20 transition-all duration-300">
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
          </motion.div>

          {/* Free Trial — featured */}
          <motion.div
            variants={staggerItem}
            className="bg-card/80 backdrop-blur-sm border-2 border-primary/60 rounded-2xl p-7 flex flex-col relative glow-sm dark:glow-md shimmer-overlay"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold shadow-md shadow-primary/25">
                <Sparkle className="w-3 h-3 mr-1" weight="duotone" />
                {t('landing.recommended')}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{t('landing.plan_trial')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('landing.plan_trial_desc')}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gradient">€0</span>
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25">
                  {t('landing.start_trial')}
                  <ArrowRight className="w-4 h-4 ml-2" weight="bold" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Premium */}
          <motion.div variants={staggerItem} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-7 flex flex-col hover:border-primary/20 transition-all duration-300">
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
          </motion.div>
        </motion.div>

        <motion.p
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {t('landing.pricing_note')}
        </motion.p>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <motion.div
          className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shimmer-overlay"
          style={{
            background: 'linear-gradient(135deg, oklch(0.6723 0.1606 244.9955) 0%, oklch(0.62 0.18 265) 50%, oklch(0.58 0.20 285) 100%)',
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute -top-20 -right-20 w-60 h-60 bg-white/8 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, type: "tween" as const }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/15 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, type: "tween" as const, delay: 2 }}
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              {t('home.cta_title')}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              {t('home.cta_subtitle')}
            </p>
            <Link to="/register">
              <motion.div className="inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-10 h-12 rounded-xl shadow-lg text-base"
                >
                  {t('home.cta_button')}
                  <ArrowRight className="w-5 h-5 ml-2" weight="bold" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
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
  icon: React.ComponentType<{ className?: string; weight?: IconWeight }>
  title: string
  description: string
  iconBg: string
  iconColor: string
}

function FeatureCard({ icon: Icon, title, description, iconBg, iconColor }: FeatureCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-colors duration-300"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
        <Icon className={`w-6 h-6 ${iconColor}`} weight="duotone" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
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
