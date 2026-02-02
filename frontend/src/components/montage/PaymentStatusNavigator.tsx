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
  
  const getNextStatus = () => {
    switch (currentStatus) {
      case 'NotPaid': return 'PartiallyPaid'
      case 'PartiallyPaid': return 'Paid'
      case 'Paid': return 'PartiallyPaid'
      default: return 'NotPaid'
    }
  }
  
  const getPreviousStatus = () => {
    switch (currentStatus) {
      case 'PartiallyPaid': return 'NotPaid'
      case 'Paid': return 'PartiallyPaid'
      default: return 'NotPaid'
    }
  }
  
  const handleNext = () => {
    const nextStatus = getNextStatus()
    
    if (nextStatus === 'Paid') {
      // Автоматично задаваме пълната сума
      onStatusChange(nextStatus, totalPrice)
    } else if (nextStatus === 'PartiallyPaid') {
      // Показваме диалог за въвеждане на сума
      setNextStatusTarget(nextStatus)
      setTempAmount(paidAmount || 0)
      setShowAmountDialog(true)
    } else {
      onStatusChange(nextStatus)
    }
  }
  
  const handlePrevious = () => {
    const prevStatus = getPreviousStatus()
    
    if (prevStatus === 'NotPaid') {
      onStatusChange(prevStatus, 0)
    } else if (prevStatus === 'PartiallyPaid') {
      // Показваме диалог за въвеждане на сума
      setNextStatusTarget(prevStatus)
      setTempAmount(paidAmount || 0)
      setShowAmountDialog(true)
    } else {
      onStatusChange(prevStatus)
    }
  }
  
  const handleSaveAmount = () => {
    if (tempAmount > totalPrice) {
      alert(t('montages.amount_exceeds_total', 'Amount cannot exceed total price'))
      return
    }
    
    onStatusChange(nextStatusTarget, tempAmount)
    setShowAmountDialog(false)
  }
  
  const getStatusColor = () => {
    switch (currentStatus) {
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
  
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePrevious}
          disabled={disabled || currentStatus === 'NotPaid'}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Badge 
          variant="outline"
          className={getStatusColor()}
        >
          {getPaymentStatusLabel(currentStatus)}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          disabled={disabled}
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
                value={tempAmount}
                onChange={(e) => setTempAmount(Number(e.target.value))}
                max={totalPrice}
                min={0}
                step="0.01"
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
