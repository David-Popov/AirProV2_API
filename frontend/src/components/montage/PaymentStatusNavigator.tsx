import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PAYMENT_STATUS_ORDER, PAYMENT_STATUS_COLORS } from '@/lib/montage-status'
import { useStatusLabels } from '@/hooks/useStatusLabels'
import { formatCurrency } from '@/lib/formatters'

interface PaymentStatusNavigatorProps {
  currentStatus: string
  totalPrice: number
  paidAmount: number
  onStatusChange: (newStatus: string, newPaidAmount?: number) => void
  disabled?: boolean
}

export function PaymentStatusNavigator({
  currentStatus,
  totalPrice,
  paidAmount,
  onStatusChange,
  disabled,
}: PaymentStatusNavigatorProps) {
  const { t } = useTranslation()
  const { getPaymentStatusLabel } = useStatusLabels()
  const [showAmountDialog, setShowAmountDialog] = useState(false)
  const [tempAmount, setTempAmount] = useState(paidAmount)
  const [nextStatusTarget, setNextStatusTarget] = useState<string>('')

  const currentIndex = (PAYMENT_STATUS_ORDER as string[]).indexOf(currentStatus)

  const getStatusColor = (status?: string) => PAYMENT_STATUS_COLORS[status || currentStatus] || ''

  const triggerStatusChange = (targetStatus: string) => {
    if (targetStatus === currentStatus) return

    if (targetStatus === 'Paid') {
      onStatusChange(targetStatus, totalPrice)
    } else if (targetStatus === 'PartiallyPaid') {
      setNextStatusTarget(targetStatus)
      setTempAmount(paidAmount || 0)
      setShowAmountDialog(true)
    } else if (targetStatus === 'NotPaid') {
      onStatusChange(targetStatus, 0)
    }
  }

  const handleNext = () => {
    if (currentIndex >= PAYMENT_STATUS_ORDER.length - 1) return
    triggerStatusChange(PAYMENT_STATUS_ORDER[currentIndex + 1])
  }

  const handlePrevious = () => {
    if (currentIndex <= 0) return
    triggerStatusChange(PAYMENT_STATUS_ORDER[currentIndex - 1])
  }

  const handleSaveAmount = () => {
    if (tempAmount > totalPrice) {
      alert(t('montages.amount_exceeds_total', 'Amount cannot exceed total price'))
      return
    }

    onStatusChange(nextStatusTarget, tempAmount)
    setShowAmountDialog(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePrevious}
          disabled={disabled || currentIndex <= 0}
          aria-label={t('common.previous')}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Select
          value={currentStatus}
          onValueChange={(val) => triggerStatusChange(val)}
          disabled={disabled}
        >
          <SelectTrigger className={`w-auto min-w-32.5 h-8 border text-xs font-medium px-3 ${getStatusColor()}`}>
            <SelectValue>{getPaymentStatusLabel(currentStatus)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            {PAYMENT_STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status} className="cursor-pointer">
                <Badge variant="outline" className={`${getStatusColor(status)} border-0 bg-transparent px-0`}>
                  {getPaymentStatusLabel(status)}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          disabled={disabled || currentIndex >= PAYMENT_STATUS_ORDER.length - 1}
          aria-label={t('common.next')}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={showAmountDialog} onOpenChange={setShowAmountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('montages.enter_payment_amount', 'Enter Payment Amount')}</DialogTitle>
            <DialogDescription className="hidden">Enter partial payment amount</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">{t('montages.paid_amount', 'Amount Paid')}</Label>
              <Input
                id="amount"
                type="number"
                value={tempAmount || ''}
                onFocus={() => { if (tempAmount === 0) setTempAmount('' as unknown as number) }}
                onChange={(e) => setTempAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                max={totalPrice}
                min={0}
                step="0.01"
                placeholder="0"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('montages.total_price')}: {formatCurrency(totalPrice || 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('montages.remaining', 'Remaining')}: {formatCurrency((totalPrice || 0) - tempAmount)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAmountDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveAmount}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
