import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatChartMonth } from '@/lib/formatters'
import type { Montage } from '@/types'

interface MonthDataPoint {
  month: string
  [key: string]: string | number
}

interface StatusCount {
  status: string
  count: number
  fill: string
}

interface SummaryStats {
  totalRevenue: number
  totalMontages: number
  completedMontages: number
  completionRate: number
  revenueTrend: number
  montagesTrend: number
}

export interface DashboardData {
  revenueByMonth: MonthDataPoint[]
  statusBreakdown: StatusCount[]
  paymentByMonth: MonthDataPoint[]
  activityByMonth: MonthDataPoint[]
  summary: SummaryStats
}

const STATUS_COLORS: Record<string, string> = {
  Planned: 'var(--color-Planned)',
  InProgress: 'var(--color-InProgress)',
  Completed: 'var(--color-Completed)',
  Canceled: 'var(--color-Canceled)',
  Overdue: 'var(--color-Overdue)',
}

function getMonthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
  while (current <= endMonth) {
    months.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

export function useDashboardData(
  montages: Montage[],
  startDate: Date,
  endDate: Date
): DashboardData {
  const { i18n } = useTranslation()

  return useMemo(() => {
    const months = getMonthsBetween(startDate, endDate)
    const locale = i18n.language === 'bg' ? 'bg-BG' : 'en-US'
    const monthLabel = (date: Date) =>
      formatChartMonth(date, { totalMonths: months.length, locale })

    const filteredMontages = montages.filter(m => {
      const d = new Date(m.created_at)
      return d >= startDate && d <= endDate
    })

    // Revenue by month
    const revenueByMonth: MonthDataPoint[] = months.map(date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthMontages = montages.filter(m => {
        const isRevenueEligible = m.status === 'Completed' || m.payment_status === 'Paid'
        if (!isRevenueEligible) return false
        const dateStr = m.completion_date || m.installation_date
        if (!dateStr) return false
        const d = new Date(dateStr)
        return d.getFullYear() === year && d.getMonth() === month
      })
      const revenue = monthMontages.reduce((sum, m) => sum + (m.paid_amount || m.total_price || 0), 0)
      return {
        month: monthLabel(date),
        revenue,
      }
    })

    // Status breakdown (donut)
    const statusCounts: Record<string, number> = {}
    for (const m of filteredMontages) {
      const s = m.status || 'Unknown'
      statusCounts[s] = (statusCounts[s] || 0) + 1
    }
    const statusBreakdown: StatusCount[] = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: STATUS_COLORS[status] || 'var(--color-muted-foreground)',
    }))

    // Payment status by month (stacked bar)
    const paymentByMonth: MonthDataPoint[] = months.map(date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthMontages = montages.filter(m => {
        const d = new Date(m.created_at)
        return d.getFullYear() === year && d.getMonth() === month
      })
      return {
        month: monthLabel(date),
        NotPaid: monthMontages.filter(m => m.payment_status === 'NotPaid' || !m.payment_status).length,
        PartiallyPaid: monthMontages.filter(m => m.payment_status === 'PartiallyPaid').length,
        Paid: monthMontages.filter(m => m.payment_status === 'Paid').length,
        Overdue: monthMontages.filter(m => m.payment_status === 'Overdue').length,
      }
    })

    // Activity by month (grouped bar: created vs completed)
    const activityByMonth: MonthDataPoint[] = months.map(date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const created = montages.filter(m => {
        const d = new Date(m.created_at)
        return d.getFullYear() === year && d.getMonth() === month
      }).length
      const completed = montages.filter(m => {
        if (m.status !== 'Completed') return false
        const dateStr = m.completion_date || m.installation_date
        if (!dateStr) return false
        const d = new Date(dateStr)
        return d.getFullYear() === year && d.getMonth() === month
      }).length
      return {
        month: monthLabel(date),
        created,
        completed,
      }
    })

    // Summary stats
    const totalRevenue = revenueByMonth.reduce((s, d) => s + (d.revenue as number), 0)
    const totalMontages = filteredMontages.length
    const completedMontages = filteredMontages.filter(m => m.status === 'Completed').length
    const completionRate = totalMontages > 0 ? Math.round((completedMontages / totalMontages) * 100) : 0

    // Trends: compare second half vs first half of the period
    const half = Math.floor(revenueByMonth.length / 2)
    const recentRevenue = revenueByMonth.slice(half).reduce((s, d) => s + (d.revenue as number), 0)
    const previousRevenue = revenueByMonth.slice(0, half).reduce((s, d) => s + (d.revenue as number), 0)
    const revenueTrend = previousRevenue > 0
      ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
      : recentRevenue > 0 ? 100 : 0

    const recentActivity = activityByMonth.slice(half).reduce((s, d) => s + (d.created as number), 0)
    const previousActivity = activityByMonth.slice(0, half).reduce((s, d) => s + (d.created as number), 0)
    const montagesTrend = previousActivity > 0
      ? Math.round(((recentActivity - previousActivity) / previousActivity) * 100)
      : recentActivity > 0 ? 100 : 0

    return {
      revenueByMonth,
      statusBreakdown,
      paymentByMonth,
      activityByMonth,
      summary: {
        totalRevenue,
        totalMontages,
        completedMontages,
        completionRate,
        revenueTrend,
        montagesTrend,
      },
    }
  }, [montages, startDate, endDate, i18n.language])
}
