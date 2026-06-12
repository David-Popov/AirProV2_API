import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Check,
  Loader2,
  Sparkles,
  CreditCard,
  Settings as SettingsIcon,
  ArrowRight,
  Users,
  ExternalLink,
  Receipt,
  CreditCard as CreditCardIcon,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { stripeService, employeeService } from '@/services'
import type { StripePlan, StripeSubscriptionInfo, EmployeeLimits } from '@/types'

export default function SubscriptionSection() {
  const { t } = useTranslation()
  const [plan, setPlan] = useState<StripePlan | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<StripeSubscriptionInfo | null>(null)
  const [employeeLimits, setEmployeeLimits] = useState<EmployeeLimits | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [planData, statusData, limitsData] = await Promise.all([
        stripeService.getPlan(),
        stripeService.getSubscriptionStatus(),
        employeeService.getLimits().catch(() => null)
      ])
      setPlan(planData)
      setSubscriptionInfo(statusData)
      setEmployeeLimits(limitsData)
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

      {subscriptionInfo && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              {t('subscription.manage_billing', 'Manage Your Subscription')}
            </CardTitle>
            <CardDescription>
              {subscriptionInfo.hasStripeSubscription
                ? t('subscription.manage_billing_desc', 'Update payment methods, view invoices, or cancel your subscription through the Stripe Customer Portal.')
                : t('subscription.manage_billing_trial_desc', 'Once you subscribe through Stripe, you can manage your payment methods, view invoices, and cancel your subscription from here.')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionInfo.hasStripeSubscription ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="rounded-full p-2 bg-blue-500/10 mt-0.5 shrink-0">
                      <CreditCardIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('subscription.update_payment', 'Update Payment')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('subscription.update_payment_desc', 'Change your payment method')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="rounded-full p-2 bg-green-500/10 mt-0.5 shrink-0">
                      <Receipt className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('subscription.view_invoices', 'View Invoices')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('subscription.view_invoices_desc', 'Download past invoices')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="rounded-full p-2 bg-red-500/10 mt-0.5 shrink-0">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('subscription.cancel_sub', 'Cancel Subscription')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('subscription.cancel_sub_desc', 'Cancel anytime, no penalty')}</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  {t('subscription.open_portal', 'Open Stripe Customer Portal')}
                </Button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t('subscription.portal_available_after_subscribe', 'Subscribe to a paid plan to unlock subscription management, including payment updates, invoices, and cancellation options.')}
                  </p>
                </div>
                {plan?.priceId && (
                  <Button 
                    variant="outline"
                    className="shrink-0"
                    onClick={handleSubscribe}
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {t('subscription.subscribe', 'Subscribe Now')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {employeeLimits && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {t('subscription.employee_limits', 'Employee Limits')}
            </CardTitle>
            <CardDescription>
              {t('subscription.employee_limits_description', 'Track your employee usage based on your subscription plan')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('subscription.employees_used', 'Employees Used')}
              </span>
              <span className="font-semibold text-foreground">
                {employeeLimits.current_count} / {employeeLimits.max_count === 999 ? t('common.unlimited', 'Unlimited') : employeeLimits.max_count}
              </span>
            </div>

            {employeeLimits.max_count !== 999 && (
              <div className="space-y-2">
                <Progress
                  value={(employeeLimits.current_count / employeeLimits.max_count) * 100}
                  className="h-2"
                />
                {!employeeLimits.can_add_more && (
                  <p className="text-sm text-orange-500 dark:text-orange-400">
                    {t('subscription.employee_limit_reached', 'You have reached your employee limit. Upgrade to add more employees.')}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('subscription.current_plan')}: <span className="font-medium text-foreground">{employeeLimits.subscription_plan}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
