import { toast } from 'sonner'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'

/**
 * Maps a raw English error message returned by the backend (RFC 7807
 * ProblemDetails `detail`, surfaced through `extractErrorMessage` +
 * `api.ts`'s `throw new Error(message)`) to a localized string using the
 * existing i18next resources.
 *
 * The backend has no localization layer, so all of its messages are English.
 * This is the single place that turns them into the user's chosen language.
 *
 * Design notes:
 * - Imports the i18n singleton directly so it works in React components AND in
 *   plain service-layer catch blocks (no `t` plumbing required).
 * - Composite backend messages are joined with "; " — we split ONLY on that
 *   separator, never on "." (so "Insufficient stock for X. Available: A,
 *   Requested: R" stays a single clause).
 * - Unmatched clauses fall through unchanged (English) so nothing disappears.
 */

interface ErrorRule {
  pattern: RegExp
  key: string
  params?: (match: RegExpMatchArray) => Record<string, string | number>
}

// Ordered most-specific / parameterized first; first match wins.
const RULES: ErrorRule[] = [
  {
    pattern: /^Paid amount \(([\d.,]+)\) is less than total price \(([\d.,]+)\)\.?$/i,
    key: 'montages.error_amount_less_than_total_params',
    params: (m) => ({ paid: m[1], total: m[2] }),
  },
  {
    pattern: /^Insufficient stock for (.+?)\. Available:\s*([\d.,]+),\s*Requested:\s*([\d.,]+)\.?$/i,
    key: 'montages.insufficient_stock_for',
    params: (m) => ({ name: m[1], available: m[2], requested: m[3] }),
  },
  {
    pattern: /^Insufficient stock\. Available:\s*([\d.,]+),\s*Needed additional:\s*([\d.,]+)\.?$/i,
    key: 'montages.insufficient_stock_needed',
    params: (m) => ({ available: m[1], needed: m[2] }),
  },
  {
    pattern: /^Cannot edit material: inventory item '(.+?)' is deactivated\.?$/i,
    key: 'montages.material_item_deactivated',
    params: (m) => ({ name: m[1] }),
  },
  {
    pattern: /^Cannot add material: inventory item '(.+?)' is deactivated\.?$/i,
    key: 'montages.material_item_add_deactivated',
    params: (m) => ({ name: m[1] }),
  },
  {
    pattern: /^Inventory item (.+?) not found\.?$/i,
    key: 'montages.inventory_item_not_found',
    params: (m) => ({ id: m[1] }),
  },
  {
    pattern: /^A montage with the same company, client email, installation date, and air conditioner already exists\.?$/i,
    key: 'montages.error_duplicate_montage',
  },
  {
    pattern: /^Payment is not fully paid\.?$/i,
    key: 'montages.error_not_fully_paid',
  },
  {
    pattern: /^Indoor unit serial number is required\.?$/i,
    key: 'montages.error_indoor_serial_required',
  },
  {
    pattern: /^Outdoor unit serial number is required\.?$/i,
    key: 'montages.error_outdoor_serial_required',
  },
  {
    pattern: /^Insufficient stock\.?$/i,
    key: 'montages.insufficient_stock',
  },
]

// Known ProblemDetails `title` values prepended by `extractErrorMessage`
// ("{title}: {detail}"). Kept as an explicit allowlist so the strip can never
// greedily eat a real message body (e.g. "Insufficient stock for X. Available:").
const TITLE_PREFIX_RE =
  /^(Validation failed|Validation Error|Not found|Forbidden|Bad request|Internal server error)\s*:\s+/i

// The montage-completion validator repeats this prefix on every clause.
const COMPLETION_PREFIX_RE = /^Montage cannot be completed:\s*/i

function translateClause(clause: string): string {
  const text = clause.trim()
  for (const rule of RULES) {
    const match = text.match(rule.pattern)
    if (match) {
      return i18n.t(rule.key, rule.params ? rule.params(match) : undefined) as string
    }
  }
  return text
}

/**
 * Show an error toast for a failed API call. Translates the message when `error`
 * is an `Error` (the shape `api.ts` throws); otherwise shows `fallbackMessage`,
 * or a generic "unknown error" when none is given.
 *
 * Collapses the repeated
 *   `toast.error(error instanceof Error ? translateApiError(error.message) : t('...'))`
 * pattern at call sites. Pass `t` so the caller's i18n binding is used.
 */
export function notifyApiError(error: unknown, t: TFunction, fallbackMessage?: string): void {
  const message =
    error instanceof Error ? translateApiError(error.message) : fallbackMessage ?? t('common.unknown_error')
  toast.error(message)
}

export function translateApiError(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) {
    return i18n.t('common.unknown_error') as string
  }

  const stripped = raw.replace(TITLE_PREFIX_RE, '')

  const translated = stripped
    .split('; ')
    .map((clause) => clause.replace(COMPLETION_PREFIX_RE, '').trim())
    .filter((clause) => clause.length > 0)
    .map(translateClause)

  // De-dupe: the composite backend string repeats the completion prefix, which
  // can collapse to identical translated lines.
  return Array.from(new Set(translated)).join('; ')
}
