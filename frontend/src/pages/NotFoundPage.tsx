import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Snowflake } from 'lucide-react'
import { AcIcon } from '@/components/AcIcon'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto animate-fade-in">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-2 mb-10 opacity-60">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <AcIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-foreground">AirPro</span>
        </div>

        {/* 404 number */}
        <p className="text-[8rem] sm:text-[10rem] font-bold leading-none text-foreground/5 select-none mb-2 tracking-tight">
          404
        </p>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 -mt-6">
          <Snowflake className="w-8 h-8 text-primary opacity-70" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="gap-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
