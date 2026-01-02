import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
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
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-20">
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
            icon="📋"
          />
          <FeatureCard 
            title="Inventory Management"
            description="Manage your materials and parts with real-time stock tracking."
            icon="📦"
          />
          <FeatureCard 
            title="Team Management"
            description="Add employees and manage your team all in one place."
            icon="👥"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
