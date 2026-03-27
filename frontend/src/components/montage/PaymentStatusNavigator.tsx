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

interface PaymentStatusNavigatorProps {
  currentStatus: string
  totalPrice: number
  paidAmount: number
  onStatusChange: (newStatus: string, newPaidAmount?: number) => void
  disabled?: boolean
  getPaymentStatusLabel: (status: string) => string
}

const PAYMENT_STATUSES = ['NotPaid', 'PartiallyPaid', 'Paid']

export function PaymentStatusNavigator({ 
  currentStatus, 
  totalPrice,
  paidAmount,
  onStatusChange, 
  disabled,
  getPaymentStatusLabel
}: PaymentStatusNavigatorProps) {
  const { t } = useTranslation()
  const [showAmountDialog, setShowAmountDialog] = useState(false)
  const [tempAmount, setTempAmount] = useState(paidAmount)
  const [nextStatusTarget, setNextStatusTarget] = useState<string>('')
  
  const currentIndex = PAYMENT_STATUSES.indexOf(currentStatus)
  
  const getStatusColor = (status?: string) => {
    const s = status || currentStatus
    switch (s) {
      case 'Paid':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 border-green-500/20'
      case 'PartiallyPaid':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/20'
      case 'NotPaid':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 border-red-500/20'
      default:
        return ''
    }
  }

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
    if (currentIndex >= PAYMENT_STATUSES.length - 1) return
    triggerStatusChange(PAYMENT_STATUSES[currentIndex + 1])
  }
  
  const handlePrevious = () => {
    if (currentIndex <= 0) return
    triggerStatusChange(PAYMENT_STATUSES[currentIndex - 1])
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
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Select
          value={currentStatus}
          onValueChange={(val) => triggerStatusChange(val)}
          disabled={disabled}
        >
          <SelectTrigger className={`w-auto min-w-[130px] h-8 border text-xs font-medium px-3 ${getStatusColor()}`}>
            <SelectValue>{getPaymentStatusLabel(currentStatus)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            {PAYMENT_STATUSES.map((status) => (
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
          disabled={disabled || currentIndex >= PAYMENT_STATUSES.length - 1}
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
              {t('montages.total_price')}: ${totalPrice?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('montages.remaining', 'Remaining')}: ${((totalPrice || 0) - tempAmount).toFixed(2)}
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
