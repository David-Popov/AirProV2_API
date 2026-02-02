import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Check, 
  Loader2, 
  Sparkles,
  CreditCard,
  Settings as SettingsIcon,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { stripeService } from '@/services'
import type { StripePlan, StripeSubscriptionInfo } from '@/types'

export default function SubscriptionSection() {
  const { t } = useTranslation()
  const [plan, setPlan] = useState<StripePlan | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<StripeSubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [planData, statusData] = await Promise.all([
        stripeService.getPlan(),
        stripeService.getSubscriptionStatus()
      ])
      setPlan(planData)
      setSubscriptionInfo(statusData)
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
      toast.error(t('common.unknown_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!plan?.priceId) {
      toast.error(t('subscription.price_not_configured'))
      return
    }
    
    setIsRedirecting(true)
    try {
      await stripeService.redirectToCheckout()
    } catch (error) {
      console.error('Failed to redirect to checkout:', error)
      toast.error(t('subscription.checkout_error'))
      setIsRedirecting(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsRedirecting(true)
    try {
      await stripeService.redirectToPortal()
    } catch (error) {
      console.error('Failed to redirect to portal:', error)
      toast.error(t('subscription.portal_error'))
      setIsRedirecting(false)
    }
  }

  const isPremiumSubscriber = subscriptionInfo?.plan === 'Premium' && subscriptionInfo?.isActive

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current subscription status */}
      {subscriptionInfo && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('subscription.current_plan')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {subscriptionInfo.plan}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={subscriptionInfo.isActive ? 'default' : 'destructive'}>
                    {subscriptionInfo.status}
                  </Badge>
                  {subscriptionInfo.currentPeriodEnd && (
                    <span className="text-sm text-muted-foreground">
                      {t('subscription.renews_on', { 
                        date: new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString() 
                      })}
                    </span>
                  )}
                  {subscriptionInfo.trialEndDate && !subscriptionInfo.hasStripeSubscription && (
                    <span className="text-sm text-muted-foreground">
                      {t('subscription.trial_ends', { 
                        date: new Date(subscriptionInfo.trialEndDate).toLocaleDateString() 
                      })}
                    </span>
                  )}
                </div>
              </div>
              {subscriptionInfo.hasStripeSubscription && (
                <Button 
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SettingsIcon className="w-4 h-4 mr-2" />
                  )}
                  {t('subscription.manage')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Plan Card */}
      {plan && !isPremiumSubscriber && (
        <Card className="relative overflow-hidden border-primary shadow-lg shadow-primary/10">
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-primary/80 text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-bl-xl">
            {t('subscription.popular')}
          </div>
          
          <CardHeader className="text-center pb-6 pt-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <Sparkles className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('subscription.perfect_for_business')}
            </CardDescription>
            <div className="mt-6">
              <span className="text-5xl font-bold text-foreground">€{plan.price}</span>
              <span className="text-muted-foreground text-lg">/{t('subscription.month')}</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-8">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="rounded-full p-1 bg-green-500/10 mt-0.5">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-600 hover:via-purple-600 hover:to-violet-700 h-12 text-base font-semibold shadow-lg shadow-violet-500/30"
              disabled={isRedirecting || !plan.priceId}
              onClick={handleSubscribe}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('subscription.redirecting')}
                </>
              ) : !plan.priceId ? (
                t('subscription.coming_soon')
              ) : (
                <>
                  {t('subscription.subscribe')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              {t('subscription.secure_payment')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
