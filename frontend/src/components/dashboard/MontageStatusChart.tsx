import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pie, PieChart, Label } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { montageStatusChartConfig } from '@/lib/chart-config'

interface MontageStatusChartProps {
  data: Array<{ status: string; count: number; fill: string }>
}

export function MontageStatusChart({ data }: MontageStatusChartProps) {
  const { t } = useTranslation()

  const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data])

  const translatedConfig = useMemo(() => {
    const config = { ...montageStatusChartConfig } as Record<string, { label: string; color: string }>
    if (config.Planned) config.Planned = { ...config.Planned, label: t('dashboard.status_planned') }
    if (config.InProgress) config.InProgress = { ...config.InProgress, label: t('dashboard.status_in_progress') }
    if (config.Completed) config.Completed = { ...config.Completed, label: t('dashboard.status_completed') }
    if (config.Canceled) config.Canceled = { ...config.Canceled, label: t('dashboard.status_cancelled') }
    if (config.Overdue) config.Overdue = { ...config.Overdue, label: t('dashboard.status_overdue') }
    return config
  }, [t])

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.montage_status')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={translatedConfig} className="mx-auto aspect-square h-55 sm:h-65">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={85}
                strokeWidth={3}
                stroke="hsl(var(--card))"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {total}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                            {t('dashboard.total')}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
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
