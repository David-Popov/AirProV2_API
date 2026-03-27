import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { revenueChartConfig } from '@/lib/chart-config'
import { formatCurrency } from '@/lib/formatters'

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>
  totalRevenue: number
  trend: number
}

export function RevenueChart({ data, totalRevenue, trend }: RevenueChartProps) {
  const { t } = useTranslation()
  const hasData = data.some(d => d.revenue > 0)

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">{t('dashboard.revenue_overview')}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</span>
            {trend !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={revenueChartConfig} className="h-55 sm:h-65 w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} tickFormatter={(v) => `€${v.toLocaleString()}`} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => {
                      if (typeof value === 'number') return formatCurrency(value)
                      return value
                    }}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-55 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('dashboard.no_revenue_data')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
