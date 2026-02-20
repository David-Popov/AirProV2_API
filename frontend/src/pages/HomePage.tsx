import { Link } from 'react-router-dom'
import {
  Snowflake,
  ClipboardList,
  Package,
  Users,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-60 -right-60 w-125 h-125 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-60 w-100 h-100 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-75 h-75 bg-violet-400/5 rounded-full blur-3xl" />
      </div>

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <Snowflake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AirPro</span>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-medium text-sm">6-month free trial included</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            The ERP built for{' '}
            <span className="text-primary">AC companies</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage installations, inventory, and your team in one place.
            Built specifically for air conditioning businesses — no bloat, no complexity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base shadow-lg shadow-primary/25 rounded-xl"
              >
                Create your account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-12 text-base rounded-xl"
              >
                Sign in
              </Button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Set up in minutes
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Cancel anytime
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
                { label: 'Active Jobs', val: '12', color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Completed', val: '84', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Inventory', val: '247', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
                { label: 'Team', val: '6', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-border/50`}>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
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
            Everything your team needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From the first site visit to the final invoice — AirPro covers every step.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={ClipboardList}
            title="Montage Tracking"
            description="Log every AC installation with client details, serial numbers, dates, and real-time status updates."
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <FeatureCard
            icon={Package}
            title="Inventory Management"
            description="Track stock levels in real-time. Get automatic low-stock alerts before you run out on-site."
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <FeatureCard
            icon={Users}
            title="Team Management"
            description="Invite employees, assign roles, track workloads, and manage performance from one dashboard."
            iconBg="bg-violet-500/10"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <FeatureCard
            icon={BarChart3}
            title="Revenue Analytics"
            description="Track completed montages, revenue over time, and spot your busiest periods at a glance."
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <FeatureCard
            icon={Bell}
            title="Maintenance Reminders"
            description="Automatically reminds you when clients are due for annual AC service — never miss a follow-up."
            iconBg="bg-rose-500/10"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <FeatureCard
            icon={Shield}
            title="Secure & Role-Based"
            description="Enterprise-grade security with encrypted data and granular access control per employee role."
            iconBg="bg-sky-500/10"
            iconColor="text-sky-600 dark:text-sky-400"
          />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <StatItem value="500+" label="Active Companies" icon={<TrendingUp className="w-5 h-5 text-primary" />} />
            <StatItem value="10K+" label="Montages Tracked" icon={<ClipboardList className="w-5 h-5 text-primary" />} />
            <StatItem value="99.9%" label="Uptime" icon={<Zap className="w-5 h-5 text-primary" />} />
            <StatItem value="6 mo" label="Free Trial" icon={<Snowflake className="w-5 h-5 text-primary" />} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="bg-primary rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
              Ready to run a tighter operation?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Create your account in under 2 minutes and get 6 months free — no card needed.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-10 h-12 rounded-xl shadow-lg text-base"
              >
                Get Started — It's Free
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
              <Snowflake className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© 2026 AirPro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
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

function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
