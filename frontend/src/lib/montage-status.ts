/**
 * Single source of truth for montage + payment status metadata: the
 * navigator order, the i18n label keys, and the color treatments.
 *
 * Labels are resolved to localized strings via the `useStatusLabels` hook
 * (it owns the `t()` binding); this module stays pure data so it can be
 * imported anywhere without React.
 */

export type MontageStatus = 'Planned' | 'InProgress' | 'Completed' | 'Canceled' | 'Overdue'
export type PaymentStatus = 'NotPaid' | 'PartiallyPaid' | 'Paid' | 'Overdue'

/** Manually-selectable montage statuses, in navigator order. `Overdue` is derived, not selectable. */
export const MONTAGE_STATUS_ORDER: MontageStatus[] = ['Planned', 'InProgress', 'Completed', 'Canceled']

/** Manually-selectable payment statuses, in navigator order. */
export const PAYMENT_STATUS_ORDER: PaymentStatus[] = ['NotPaid', 'PartiallyPaid', 'Paid']

/** i18n key + English fallback per montage status. Keys already exist in src/locales. */
export const MONTAGE_STATUS_LABEL_KEYS: Record<string, { key: string; fallback: string }> = {
  Planned: { key: 'montages.status_planned', fallback: 'Planned' },
  InProgress: { key: 'montages.status_in_progress', fallback: 'In Progress' },
  Completed: { key: 'montages.status_completed', fallback: 'Completed' },
  Canceled: { key: 'montages.status_canceled', fallback: 'Cancelled' },
  Overdue: { key: 'montages.status_overdue', fallback: 'Overdue' },
}

/** i18n key + English fallback per payment status. */
export const PAYMENT_STATUS_LABEL_KEYS: Record<string, { key: string; fallback: string }> = {
  NotPaid: { key: 'montages.payment_not_paid', fallback: 'Not Paid' },
  PartiallyPaid: { key: 'montages.payment_partially_paid', fallback: 'Partially Paid' },
  Paid: { key: 'montages.payment_paid', fallback: 'Paid' },
  Overdue: { key: 'montages.payment_overdue', fallback: 'Overdue' },
}

/** List/table aesthetic — accent left stripe. Used in the montages list rows. */
export const MONTAGE_STATUS_COLORS_LIST: Record<string, string> = {
  Planned: 'bg-primary/10 text-primary border-primary/20 border-l-2 border-l-primary/50',
  InProgress: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 border-l-2 border-l-amber-500/60',
  Completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border-l-2 border-l-emerald-500/60',
  Canceled: 'bg-muted text-muted-foreground border-border border-l-2 border-l-muted-foreground/30',
  Overdue: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 border-l-2 border-l-orange-500/60',
}

/** Detail-header aesthetic — solid tint, no stripe. Used on the montage detail page + StatusNavigator. */
export const MONTAGE_STATUS_COLORS_DETAIL: Record<string, string> = {
  Planned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  InProgress: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  Canceled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  Overdue: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
}

/** Payment status color treatment. Used in PaymentStatusNavigator + montage list payment text. */
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 border-green-500/20',
  PartiallyPaid: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/20',
  NotPaid: 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 border-red-500/20',
}
