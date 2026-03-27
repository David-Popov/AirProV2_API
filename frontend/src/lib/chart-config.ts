import type { ChartConfig } from '@/components/ui/chart'

export const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(142 71% 45%)', // green-500
  },
} satisfies ChartConfig

export const montageStatusChartConfig = {
  Planned: {
    label: 'Planned',
    color: 'hsl(var(--primary))',
  },
  InProgress: {
    label: 'In Progress',
    color: 'hsl(45 93% 47%)', // amber-500
  },
  Completed: {
    label: 'Completed',
    color: 'hsl(142 71% 45%)', // green-500
  },
  Canceled: {
    label: 'Cancelled',
    color: 'hsl(var(--muted-foreground))',
  },
  Overdue: {
    label: 'Overdue',
    color: 'hsl(0 84% 60%)', // red-500
  },
} satisfies ChartConfig

export const paymentStatusChartConfig = {
  NotPaid: {
    label: 'Not Paid',
    color: 'hsl(0 84% 60%)', // red-500
  },
  PartiallyPaid: {
    label: 'Partially Paid',
    color: 'hsl(45 93% 47%)', // amber-500
  },
  Paid: {
    label: 'Paid',
    color: 'hsl(142 71% 45%)', // green-500
  },
  Overdue: {
    label: 'Overdue',
    color: 'hsl(25 95% 53%)', // orange-500
  },
} satisfies ChartConfig

export const activityChartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(var(--primary))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(142 71% 45%)', // green-500
  },
} satisfies ChartConfig
