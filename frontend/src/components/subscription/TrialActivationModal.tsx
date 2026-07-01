import { logger } from '@/lib/logger'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { translateApiError } from '@/lib/apiErrors'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { employeeService } from '@/services'

interface TrialActivationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  maxEmployees: number
}

export function TrialActivationModal({
  isOpen,
  onClose,
  onSuccess,
  maxEmployees
}: TrialActivationModalProps) {
  const { t } = useTranslation()
  const [isActivating, setIsActivating] = useState(false)

  const handleActivateTrial = async () => {
    setIsActivating(true)
    try {
      await employeeService.activateTrial()
      toast.success(
        t('subscription.trial_activated_success', '6-month trial activated successfully! You can now add unlimited employees.')
      )
      onSuccess()
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')

      if (message.includes('already been used') || message.includes('already used')) {
        toast.error(
          t('subscription.trial_already_used', 'Trial period has already been used. Please upgrade to Premium.')
        )
      } else {
        toast.error(translateApiError(message))
      }
      logger.error(error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('subscription.trial_activation_title', 'Upgrade to Free Trial')}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              {t('subscription.trial_limit_reached', {
                maxEmployees,
                defaultValue: `You've reached the limit of ${maxEmployees} employees on the Free plan.`
              })}
            </p>
            <p className="font-medium text-foreground">
              {t('subscription.trial_benefits',
                'Start a 6-month free trial to unlock:')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('subscription.trial_benefit_employees', 'Unlimited employees')}</li>
              <li>{t('subscription.trial_benefit_duration', '6 months free access')}</li>
              <li>{t('subscription.trial_benefit_no_card', 'No credit card required')}</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              {t('subscription.trial_description',
                'After the trial ends, you can choose to upgrade to Premium or return to the Free plan.')}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isActivating}
            className="w-full sm:w-auto"
          >
            {t('subscription.stay_on_free', 'Stay on Free Plan')}
          </Button>
          <Button
            onClick={handleActivateTrial}
            disabled={isActivating}
            className="w-full sm:w-auto"
          >
            {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('subscription.start_trial', 'Start Free Trial')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
