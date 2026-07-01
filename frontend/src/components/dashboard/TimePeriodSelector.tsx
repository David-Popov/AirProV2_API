import { useState } from 'react'
import { formatDate } from '@/lib/formatters'
import { useTranslation } from 'react-i18next'
import { CalendarIcon } from 'lucide-react'
import type { DateRange as RDPDateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

export type TimePeriodValue = '1m' | '3m' | '6m' | '12m' | 'custom'

export interface DateRange {
  startDate: Date
  endDate: Date
}

interface TimePeriodSelectorProps {
  value: TimePeriodValue
  onChange: (value: TimePeriodValue) => void
  customRange?: DateRange
  onCustomRangeChange?: (range: DateRange) => void
}

function getDateRange(period: TimePeriodValue): DateRange {
  const end = new Date()
  const start = new Date()
  switch (period) {
    case '1m':
      start.setMonth(start.getMonth() - 1)
      break
    case '3m':
      start.setMonth(start.getMonth() - 3)
      break
    case '6m':
      start.setMonth(start.getMonth() - 6)
      break
    case '12m':
      start.setMonth(start.getMonth() - 12)
      break
    default:
      start.setMonth(start.getMonth() - 6)
  }
  return { startDate: start, endDate: end }
}

export { getDateRange }

export function TimePeriodSelector({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
}: TimePeriodSelectorProps) {
  const { t } = useTranslation()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<RDPDateRange | undefined>(
    customRange ? { from: customRange.startDate, to: customRange.endDate } : undefined
  )

  const handlePeriodChange = (newValue: string) => {
    onChange(newValue as TimePeriodValue)
  }

  const handleRangeSelect = (range: RDPDateRange | undefined) => {
    if (!range) return
    setSelectedRange(range)
    if (range.from && range.to && onCustomRangeChange) {
      onCustomRangeChange({ startDate: range.from, endDate: range.to })
      setCalendarOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1m">{t('dashboard.period_1m')}</SelectItem>
          <SelectItem value="3m">{t('dashboard.period_3m')}</SelectItem>
          <SelectItem value="6m">{t('dashboard.period_6m')}</SelectItem>
          <SelectItem value="12m">{t('dashboard.period_12m')}</SelectItem>
          <SelectItem value="custom">{t('dashboard.period_custom')}</SelectItem>
        </SelectContent>
      </Select>

      {value === 'custom' && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              {customRange
                ? `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`
                : t('dashboard.select_range')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
