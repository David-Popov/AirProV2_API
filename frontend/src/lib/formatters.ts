export function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Coerce a string/number/Date into a valid Date, or null if it can't be parsed. */
function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Locale-aware short date (e.g. "6/28/2026"). Returns '' for invalid input.
 * Replaces inline `new Date(x).toLocaleDateString()`.
 */
export function formatDate(value: string | number | Date): string {
  return toDate(value)?.toLocaleDateString() ?? ''
}

/**
 * Locale-aware date + time (e.g. "Jun 28, 2026, 04:15 PM"). Returns '' for invalid input.
 * Replaces hand-rolled `toLocaleDateString(undefined, { …time opts })` blocks.
 */
export function formatDateTime(value: string | number | Date): string {
  return (
    toDate(value)?.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) ?? ''
  )
}

/**
 * ISO `yyyy-MM-dd` for date inputs / form defaults. Defaults to today.
 * Built from LOCAL date components (not UTC) so the default matches the user's
 * calendar date — `toISOString()` would emit tomorrow's date for UTC+ users late
 * in the evening (the app's market is Bulgaria, UTC+2/+3).
 */
export function formatDateISO(value: string | number | Date = new Date()): string {
  const d = toDate(value)
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
