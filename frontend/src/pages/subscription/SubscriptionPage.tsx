import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Check, 
  Loader2, 
  Sparkles,
  CreditCard,
  Settings,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { stripeService } from '@/services'
import type { StripePlan, StripeSubscriptionInfo } from '@/types'

export default function SubscriptionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [plan, setPlan] = useState<StripePlan | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<StripeSubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    fetchData()
    
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      toast.success(t('subscription.payment_success'))
      navigate('/subscription', { replace: true })
    }
  }, [searchParams])

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t('subscription.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('subscription.subtitle')}
        </p>
      </div>

      {subscriptionInfo && (
        <Card className="glass-card">
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
                <div className="flex items-center gap-2 mt-1">
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
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  {t('subscription.manage')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="grid place-items-center">
          <Card className="relative overflow-hidden max-w-md w-full border-primary shadow-xl shadow-primary/10">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              {t('subscription.popular')}
            </div>
            
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
                <Sparkles className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('subscription.perfect_for_business')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold text-foreground">€{plan.price}</span>
                <span className="text-muted-foreground">/{t('subscription.month')}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 h-12 text-base font-medium"
                disabled={isPremiumSubscriber || isRedirecting || !plan.priceId}
                onClick={handleSubscribe}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('subscription.redirecting')}
                  </>
                ) : isPremiumSubscriber ? (
                  t('subscription.current')
                ) : !plan.priceId ? (
                  t('subscription.coming_soon')
                ) : (
                  <>
                    {t('subscription.subscribe')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('subscription.secure_payment')}
        </p>
      </div>
    </div>
  )
}
