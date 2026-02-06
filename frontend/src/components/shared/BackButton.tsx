import { ChevronLeft, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function BackButton({ onClick, label, className }: BackButtonProps) {
  if (label) {
    return (
      <div className={cn('mb-4', className)}>
        <Button variant="ghost" onClick={onClick} className="pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('mb-4', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className="bg-card text-muted-foreground hover:text-foreground shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    </div>
  )
}
