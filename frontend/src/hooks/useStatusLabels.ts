import { useTranslation } from 'react-i18next'
import { MONTAGE_STATUS_LABEL_KEYS, PAYMENT_STATUS_LABEL_KEYS } from '@/lib/montage-status'

/**
 * Single source of truth for translating montage + payment status codes into
 * localized labels. Replaces the byte-identical getStatusLabel /
 * getPaymentStatusLabel helpers that were duplicated across MontagesPage and
 * MontageDetailsPage.
 *
 * Unknown codes fall through to the raw value (matching the previous behavior);
 * a null/undefined value resolves to the default (Planned / NotPaid) label.
 */
export function useStatusLabels() {
  const { t } = useTranslation()

  const getStatusLabel = (val?: string | null): string => {
    if (!val) {
      const def = MONTAGE_STATUS_LABEL_KEYS.Planned
      return t(def.key, def.fallback)
    }
    const entry = MONTAGE_STATUS_LABEL_KEYS[val]
    return entry ? t(entry.key, entry.fallback) : val
  }

  const getPaymentStatusLabel = (val?: string | null): string => {
    if (!val) {
      const def = PAYMENT_STATUS_LABEL_KEYS.NotPaid
      return t(def.key, def.fallback)
    }
    const entry = PAYMENT_STATUS_LABEL_KEYS[val]
    return entry ? t(entry.key, entry.fallback) : val
  }

  return { getStatusLabel, getPaymentStatusLabel }
}
