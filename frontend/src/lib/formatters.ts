export function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a date as a chart-axis month label, with sensible defaults for
 * different date-range sizes. Used by the dashboard chart hooks to keep all
 * month labels in sync across revenue / payment-status / activity charts.
 *
 * Rules:
 *   - More than 3 months in range → short month name (Jan, Feb, ...)
 *   - 3 months or fewer → long month name (January, February, ...)
 *   - More than 12 months in range → append 2-digit year (Jan '26)
 */
export function formatChartMonth(
  date: Date,
  options: { totalMonths: number; locale: string }
): string {
  return date.toLocaleDateString(options.locale, {
    month: options.totalMonths > 3 ? 'short' : 'long',
    year: options.totalMonths > 12 ? '2-digit' : undefined,
  })
}
