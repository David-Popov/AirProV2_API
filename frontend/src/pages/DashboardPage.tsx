import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-white font-bold text-xl">AirPro</span>
        </div>

        <nav className="space-y-2">
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="📋" label="Montages" />
          <NavItem icon="📦" label="Inventory" />
          <NavItem icon="👥" label="Employees" />
          <NavItem icon="❄️" label="Air Conditioners" />
          <NavItem icon="⚙️" label="Settings" />
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link to="/login">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              🚪 Logout
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, Manager!</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              + New Montage
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Montages" value="12" change="+2 this week" />
          <StatCard title="Completed" value="48" change="+8 this month" />
          <StatCard title="Inventory Items" value="156" change="5 low stock" warning />
          <StatCard title="Team Members" value="6" change="1 active now" />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Montages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MontageItem 
                  client="Ivan Petrov"
                  address="ul. Vitosha 25, Sofia"
                  status="In Progress"
                  date="Today"
                />
                <MontageItem 
                  client="Maria Ivanova"
                  address="ul. Rakovski 100, Sofia"
                  status="Scheduled"
                  date="Tomorrow"
                />
                <MontageItem 
                  client="Georgi Dimitrov"
                  address="ul. Slivnitsa 45, Plovdiv"
                  status="Completed"
                  date="Yesterday"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <InventoryItem 
                  name="Copper Pipes 6mm"
                  quantity={8}
                  minQuantity={10}
                  unit="meters"
                />
                <InventoryItem 
                  name="R410A Refrigerant"
                  quantity={3}
                  minQuantity={5}
                  unit="kg"
                />
                <InventoryItem 
                  name="Insulation Tape"
                  quantity={4}
                  minQuantity={10}
                  unit="rolls"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function StatCard({ title, value, change, warning = false }: { title: string; value: string; change: string; warning?: boolean }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6">
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
        <p className={`text-sm ${warning ? 'text-orange-400' : 'text-green-400'}`}>{change}</p>
      </CardContent>
    </Card>
  )
}

function MontageItem({ client, address, status, date }: { client: string; address: string; status: string; date: string }) {
  const statusColors: Record<string, string> = {
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Scheduled': 'bg-yellow-500/20 text-yellow-400',
    'Completed': 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
      <div>
        <p className="text-white font-medium">{client}</p>
        <p className="text-gray-400 text-sm">{address}</p>
      </div>
      <div className="text-right">
        <Badge className={statusColors[status]}>{status}</Badge>
        <p className="text-gray-500 text-sm mt-1">{date}</p>
      </div>
    </div>
  )
}

function InventoryItem({ name, quantity, minQuantity, unit }: { name: string; quantity: number; minQuantity: number; unit: string }) {
  const percentage = (quantity / minQuantity) * 100

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-medium">{name}</p>
        <Badge className="bg-red-500/20 text-red-400">Low Stock</Badge>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-gray-400 text-sm whitespace-nowrap">
          {quantity} / {minQuantity} {unit}
        </span>
      </div>
    </div>
  )
}
