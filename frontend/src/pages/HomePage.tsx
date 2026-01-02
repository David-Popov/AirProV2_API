import { Link } from 'react-router-dom'
import { 
  Snowflake, 
  ClipboardList, 
  Package, 
  Users,
  ArrowRight,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AirPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-purple-300">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
            <Check className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Free trial • No credit card required</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Manage Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}AC Business
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            The complete ERP solution for air conditioning companies. 
            Track montages, manage inventory, and grow your business.
          </p>
          <div className="flex gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <FeatureCard 
            title="Montage Tracking"
            description="Track all your AC installations with client details, status, and pricing."
            icon={ClipboardList}
          />
          <FeatureCard 
            title="Inventory Management"
            description="Manage your materials and parts with real-time stock tracking."
            icon={Package}
          />
          <FeatureCard 
            title="Team Management"
            description="Add employees and manage your team all in one place."
            icon={Users}
          />
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <StatItem value="500+" label="Companies" />
          <StatItem value="10K+" label="Montages Tracked" />
          <StatItem value="99.9%" label="Uptime" />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32 py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">© 2026 AirPro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
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
}

function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-white mb-2">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  )
}
