import { useTranslation } from 'react-i18next'
import { Check, AlertCircle } from 'lucide-react'

export type FieldStatus = 'idle' | 'valid' | 'invalid'

interface FieldMessageProps {
  status: FieldStatus
  message?: string
}

export function FieldMessage({ status, message }: FieldMessageProps) {
  const { t } = useTranslation()

  if (status === 'idle' || !message) {
    return <div className="min-h-4" />
  }

  const translatedMessage = t(message, message)

  if (status === 'invalid') {
    return (
      <p className="flex items-start gap-1 text-red-500 text-xs min-h-4 leading-4">
        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
        <span>{translatedMessage}</span>
      </p>
    )
  }

  if (status === 'valid') {
    return (
      <p className="flex items-start gap-1 text-green-500 text-xs min-h-4 leading-4">
        <Check className="w-3 h-3 shrink-0 mt-0.5" />
        <span>{translatedMessage}</span>
      </p>
    )
  }

  return <div className="min-h-4" />
}
