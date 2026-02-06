import { Link } from 'react-router-dom'
import { 
  Snowflake, 
  ClipboardList, 
  Package, 
  Users,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container mx-auto px-4 py-6">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16 backdrop-blur-sm bg-background/50 -mx-4 px-4 py-3 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-teal-500 dark:from-primary dark:to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">AirPro</span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shadow-lg shadow-primary/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center pt-12 pb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-full px-5 py-2.5 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm">Free 14-day trial • No credit card required</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Manage Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-cyan-500">
              {' '}AC Business
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            The complete ERP solution for air conditioning companies. 
            Track installations, manage inventory, and grow your business with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-lg px-8 h-14 shadow-xl shadow-primary/30 rounded-xl">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-xl border-2">
              Watch Demo
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Easy Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to run your AC business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline operations, boost productivity, and delight customers with our all-in-one platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              title="Montage Tracking"
              description="Track all your AC installations with client details, status updates, and pricing information."
              icon={ClipboardList}
              gradient="from-blue-500/20 to-cyan-500/20"
              iconColor="text-blue-500"
            />
            <FeatureCard 
              title="Inventory Management"
              description="Real-time stock tracking, low stock alerts, and automatic material deduction on montages."
              icon={Package}
              gradient="from-emerald-500/20 to-teal-500/20"
              iconColor="text-emerald-500"
            />
            <FeatureCard 
              title="Team Management"
              description="Add employees, assign roles, and track performance all in one centralized place."
              icon={Users}
              gradient="from-violet-500/20 to-purple-500/20"
              iconColor="text-violet-500"
            />
            <FeatureCard 
              title="Fast & Reliable"
              description="Lightning-fast performance with 99.9% uptime guarantee for your peace of mind."
              icon={Zap}
              gradient="from-amber-500/20 to-orange-500/20"
              iconColor="text-amber-500"
            />
            <FeatureCard 
              title="Secure & Private"
              description="Enterprise-grade security with encrypted data and role-based access control."
              icon={Shield}
              gradient="from-rose-500/20 to-pink-500/20"
              iconColor="text-rose-500"
            />
            <FeatureCard 
              title="Analytics & Reports"
              description="Powerful insights with revenue tracking, performance metrics, and custom reports."
              icon={BarChart3}
              gradient="from-primary/20 to-blue-500/20"
              iconColor="text-primary"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20">
          <div className="bg-gradient-to-br from-primary/5 via-teal-500/5 to-cyan-500/5 dark:from-primary/10 dark:via-teal-500/10 dark:to-cyan-500/10 rounded-3xl border border-border/50 p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="500+" label="Companies" icon="🏢" />
              <StatItem value="10K+" label="Montages Tracked" icon="📋" />
              <StatItem value="99.9%" label="Uptime" icon="⚡" />
              <StatItem value="24/7" label="Support" icon="💬" />
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="py-20">
          <div className="bg-gradient-to-r from-primary to-teal-500 rounded-3xl p-12 text-center text-white shadow-2xl shadow-primary/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your AC business?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies already using AirPro to streamline their operations.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 rounded-xl font-semibold shadow-lg">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-teal-500 rounded-lg flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-white" />
            </div>
            <span className="text-muted-foreground">© 2026 AirPro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground">
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
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}

function FeatureCard({ title, description, icon: Icon, gradient, iconColor }: FeatureCardProps) {
  return (
    <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StatItem({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-4xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  )
}
