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
import { useTranslation } from 'react-i18next'
import {
  MONTAGE_STATUS_ORDER,
  MONTAGE_STATUS_COLORS_LIST,
  MONTAGE_STATUS_COLORS_DETAIL,
} from '@/lib/montage-status'
import { useStatusLabels } from '@/hooks/useStatusLabels'

interface StatusNavigatorProps {
  currentStatus: string
  onStatusChange: (newStatus: string) => void
  disabled?: boolean
  /** `detail` (default) = solid detail-header colors; `list` = accent-stripe list colors. */
  variant?: 'list' | 'detail'
}

export function StatusNavigator({
  currentStatus,
  onStatusChange,
  disabled,
  variant = 'detail',
}: StatusNavigatorProps) {
  const { t } = useTranslation()
  const { getStatusLabel } = useStatusLabels()
  const statusColors = variant === 'detail' ? MONTAGE_STATUS_COLORS_DETAIL : MONTAGE_STATUS_COLORS_LIST
  const currentIndex = (MONTAGE_STATUS_ORDER as string[]).indexOf(currentStatus)

  const handlePrevious = () => {
    if (currentIndex <= 0) return
    onStatusChange(MONTAGE_STATUS_ORDER[currentIndex - 1])
  }

  const handleNext = () => {
    if (currentIndex >= MONTAGE_STATUS_ORDER.length - 1) return
    onStatusChange(MONTAGE_STATUS_ORDER[currentIndex + 1])
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handlePrevious}
        disabled={disabled || currentIndex <= 0}
        aria-label={t('common.previous')}
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
          {MONTAGE_STATUS_ORDER.map((status) => (
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
        disabled={disabled || currentIndex >= MONTAGE_STATUS_ORDER.length - 1}
        aria-label={t('common.next')}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
