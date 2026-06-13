import { logger } from '@/lib/logger'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Sparkles, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { stripeService } from '@/services'
import { toast } from 'sonner'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: 'employee_limit' | 'trial_used' | 'general'
}

export function PremiumUpgradeModal({
  isOpen,
  onClose,
  reason = 'general'
}: PremiumUpgradeModalProps) {
  const { t } = useTranslation()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleUpgrade = async () => {
    setIsRedirecting(true)
    try {
      await stripeService.redirectToCheckout()
    } catch (error) {
      logger.error('Failed to redirect to checkout:', error)
      toast.error(t('subscription.checkout_error', 'Failed to start checkout. Please try again.'))
      setIsRedirecting(false)
    }
  }

  const getReasonText = () => {
    switch (reason) {
      case 'employee_limit':
        return t('subscription.upgrade_reason_employee_limit',
          "You've reached your employee limit on the Free plan.")
      case 'trial_used':
        return t('subscription.upgrade_reason_trial_used',
          "Your trial period has been used. Upgrade to Premium for unlimited access.")
      default:
        return t('subscription.upgrade_reason_general',
          "Unlock all features with Premium.")
    }
  }

  const premiumFeatures = [
    t('subscription.feature_unlimited_employees', 'Unlimited employees'),
    t('subscription.feature_unlimited_montages', 'Unlimited montages'),
    t('subscription.feature_unlimited_inventory', 'Unlimited inventory items'),
    t('subscription.feature_priority_support', 'Priority support'),
    t('subscription.feature_advanced_reports', 'Advanced reporting'),
    t('subscription.feature_no_limits', 'No restrictions')
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {t('subscription.upgrade_to_premium', 'Upgrade to Premium')}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p className="text-base text-muted-foreground">
              {getReasonText()}
            </p>
            <p className="font-medium text-foreground">
              {t('subscription.premium_benefits', 'Premium includes:')}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="rounded-full p-1 bg-green-500/10 mt-0.5 shrink-0">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRedirecting}
            className="w-full sm:w-auto"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isRedirecting}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-600 hover:via-purple-600 hover:to-violet-700"
          >
            {isRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('subscription.upgrade_now', 'Upgrade Now')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
