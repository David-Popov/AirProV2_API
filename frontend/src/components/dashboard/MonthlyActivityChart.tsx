import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { activityChartConfig } from '@/lib/chart-config'

interface MonthlyActivityChartProps {
  data: Array<{ month: string; created: number; completed: number }>
}

export function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  const { t } = useTranslation()

  const translatedConfig = useMemo(() => ({
    created: { ...activityChartConfig.created, label: t('dashboard.montages_created') },
    completed: { ...activityChartConfig.completed, label: t('dashboard.montages_completed') },
  }), [t])

  const hasData = data.some(d => d.created > 0 || d.completed > 0)

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.monthly_activity')}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={translatedConfig} className="h-55 sm:h-65 w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-55 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('dashboard.no_data')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
