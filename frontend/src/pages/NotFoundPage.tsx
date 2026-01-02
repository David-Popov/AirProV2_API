import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white/10 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="bg-purple-600 hover:bg-purple-700">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
