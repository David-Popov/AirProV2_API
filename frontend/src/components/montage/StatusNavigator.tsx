import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STATUSES = ['Planned', 'InProgress', 'Completed', 'Canceled']

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
  const currentIndex = STATUSES.indexOf(currentStatus)

  const handlePrevious = () => {
    if (currentIndex <= 0) return
    onStatusChange(STATUSES[currentIndex - 1])
  }

  const handleNext = () => {
    if (currentIndex >= STATUSES.length - 1) return
    onStatusChange(STATUSES[currentIndex + 1])
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handlePrevious}
        disabled={disabled || currentIndex <= 0}
        className="h-8 w-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Select
        value={currentStatus}
        onValueChange={(val) => val !== currentStatus && onStatusChange(val)}
        disabled={disabled}
      >
        <SelectTrigger className={`w-auto min-w-32.5 h-8 border text-xs font-medium px-3 ${statusColors[currentStatus] || ''}`}>
          <SelectValue>{getStatusLabel(currentStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="cursor-pointer">
              <Badge variant="outline" className={`${statusColors[status] || ''} border-0 bg-transparent px-0`}>
                {getStatusLabel(status)}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleNext}
        disabled={disabled || currentIndex >= STATUSES.length - 1}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
