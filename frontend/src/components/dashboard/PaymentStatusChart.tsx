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
import { paymentStatusChartConfig } from '@/lib/chart-config'

interface PaymentStatusChartProps {
  data: Array<{ month: string; [key: string]: string | number }>
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const { t } = useTranslation()

  const translatedConfig = useMemo(() => {
    const config = { ...paymentStatusChartConfig } as Record<string, { label: string; color: string }>
    if (config.NotPaid) config.NotPaid = { ...config.NotPaid, label: t('dashboard.payment_not_paid') }
    if (config.PartiallyPaid) config.PartiallyPaid = { ...config.PartiallyPaid, label: t('dashboard.payment_partially_paid') }
    if (config.Paid) config.Paid = { ...config.Paid, label: t('dashboard.payment_paid') }
    if (config.Overdue) config.Overdue = { ...config.Overdue, label: t('dashboard.payment_overdue') }
    return config
  }, [t])

  const hasData = data.some(d =>
    (d.NotPaid as number) > 0 || (d.PartiallyPaid as number) > 0 || (d.Paid as number) > 0 || (d.Overdue as number) > 0
  )

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.payment_status')}</CardTitle>
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
              <Bar dataKey="Paid" stackId="a" fill="var(--color-Paid)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="PartiallyPaid" stackId="a" fill="var(--color-PartiallyPaid)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="NotPaid" stackId="a" fill="var(--color-NotPaid)" radius={[4, 4, 0, 0]} />
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
