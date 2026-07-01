/**
 * Status → presentation maps for the non-montage domains (problem categories,
 * admin company/montage status). Sibling of `montage-status.ts`: pure data, no
 * React and no i18n, so pages keep their `<Badge>` JSX + `t()` labels and just
 * read the color/variant from here.
 */

import { ProblemCategory } from '@/types'

/** The visual variants supported by the Shadcn `<Badge>` component. */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'

/** Admin montages list: montage status → Badge variant. Fall back to `info`. */
export const ADMIN_MONTAGE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Completed: 'success',
  InProgress: 'warning',
  Canceled: 'destructive',
}

/** Admin companies list: subscription status → Badge variant. Fall back to `secondary`. */
export const ADMIN_COMPANY_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Active: 'success',
  Trial: 'info',
  Expired: 'destructive',
  Cancelled: 'destructive',
}

/** Problem-report category → Badge className (covers every category, no fallback needed). */
export const PROBLEM_CATEGORY_COLORS: Record<ProblemCategory, string> = {
  [ProblemCategory.Bug]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [ProblemCategory.FeatureNotWorking]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [ProblemCategory.DataNotInserted]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [ProblemCategory.UIIssue]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [ProblemCategory.PerformanceIssue]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  [ProblemCategory.Other]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}
