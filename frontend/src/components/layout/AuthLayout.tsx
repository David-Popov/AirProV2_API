import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  ClipboardList,
  Box,
  Users,
  ShieldCheck,
  BarChart2,
  ArrowRight,
} from 'lucide-react'
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
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">AirPro</span>
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
                <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left decorative panel — glassmorphic, no external image */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet-600/10" />

          {/* Animated orbs */}
          <motion.div
            className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            transition={{ duration: 14, repeat: Infinity, type: "tween" as const }}
          />
          <motion.div
            className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none"
            animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, type: "tween" as const, delay: 4 }}
          />
          <motion.div
            className="absolute top-2/3 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, type: "tween" as const, delay: 2 }}
          />

          {/* Grid dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                Trusted by HVAC professionals
              </div>
            </motion.div>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, type: "tween" as const }}
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40 mb-8 glow-sm">
                <AcIcon className="w-9 h-9 text-primary-foreground" />
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4 text-foreground tracking-tight">
                {t('auth.hero_title')}
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
                {t('auth.hero_subtitle')}
              </p>

              {/* Feature list */}
              <div className="space-y-3">
                {[
                  { Icon: ClipboardList, text: t('auth.badge_montages') },
                  { Icon: Box,           text: t('auth.badge_inventory') },
                  { Icon: Users,         text: t('auth.badge_employees') },
                  { Icon: BarChart2,     text: t('auth.badge_analytics', 'Real-time analytics') },
                ].map(({ Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80 font-medium">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bottom stat pills */}
            <motion.div
              className="flex gap-3 flex-wrap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { label: 'Free to start', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
                { label: 'No credit card', color: 'bg-primary/10 text-primary border-primary/20' },
                { label: 'Cancel anytime', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${color} backdrop-blur-sm`}
                >
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right panel — form */}
        <motion.div
          className="w-full lg:w-1/2 flex items-center justify-center overflow-y-auto bg-background relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "tween" as const }}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
          <div className="relative w-full max-w-lg px-6 py-10 sm:px-10">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
