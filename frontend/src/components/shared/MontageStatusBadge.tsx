import { Badge } from '@/components/ui/badge'
import { MONTAGE_STATUS_COLORS_LIST, MONTAGE_STATUS_COLORS_DETAIL } from '@/lib/montage-status'
import { useStatusLabels } from '@/hooks/useStatusLabels'

interface MontageStatusBadgeProps {
  status?: string | null
  /** `list` (default) = table look with accent left stripe; `detail` = solid detail-header look. */
  variant?: 'list' | 'detail'
  className?: string
}

/** Localized, color-coded montage status badge. Keeps the two intentional looks in one place. */
export function MontageStatusBadge({ status, variant = 'list', className }: MontageStatusBadgeProps) {
  const { getStatusLabel } = useStatusLabels()
  const colors = variant === 'detail' ? MONTAGE_STATUS_COLORS_DETAIL : MONTAGE_STATUS_COLORS_LIST
  const colorClass = colors[status || 'Planned'] || colors.Planned
  return (
    <Badge variant="outline" className={`${colorClass}${className ? ` ${className}` : ''}`}>
      {getStatusLabel(status)}
    </Badge>
  )
}
