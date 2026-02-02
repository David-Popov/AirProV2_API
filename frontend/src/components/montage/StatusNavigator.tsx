import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StatusNavigatorProps {
  currentStatus: string
  onStatusChange: (newStatus: string) => void
  disabled?: boolean
  statusColors: Record<string, string>
  getStatusLabel: (status: string) => string
}

export function StatusNavigator({ 
  currentStatus, 
  onStatusChange, 
  disabled,
  statusColors,
  getStatusLabel
}: StatusNavigatorProps) {
  const getNextStatus = () => {
    switch (currentStatus) {
      case 'Planned': return 'InProgress'
      case 'InProgress': return 'Completed'
      case 'Completed': return 'InProgress'
      case 'Canceled': return 'Planned'
      default: return 'Planned'
    }
  }
  
  const getPreviousStatus = () => {
    switch (currentStatus) {
      case 'InProgress': return 'Planned'
      case 'Completed': return 'InProgress'
      case 'Planned': return 'Canceled'
      case 'Canceled': return 'Planned'
      default: return 'Planned'
    }
  }
  
  const canGoNext = () => {
    return currentStatus !== 'Canceled'
  }
  
  const canGoPrevious = () => {
    return currentStatus !== 'Planned' || currentStatus === 'Planned'
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onStatusChange(getPreviousStatus())}
        disabled={disabled || !canGoPrevious()}
        className="h-8 w-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Badge 
        variant="outline" 
        className={statusColors[currentStatus || 'Planned']}
      >
        {getStatusLabel(currentStatus)}
      </Badge>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onStatusChange(getNextStatus())}
        disabled={disabled || !canGoNext()}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
