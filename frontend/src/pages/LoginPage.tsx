import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Mail, Lock, Loader2, ArrowRight, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout'
import { useAuth } from '@/context'
import { authService } from '@/services'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [accountLocked, setAccountLocked] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate, location.state])

  // Show post-registration or password-reset message
  useEffect(() => {
    const stateMessage = (location.state as { message?: string })?.message
    if (stateMessage) {
      toast.info(stateMessage)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailNotConfirmed(false)
    setAccountLocked(false)

    try {
      await login({ email: formData.email, password: formData.password })
      toast.success(t('auth.login_success'))
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.login_failed')
      if (message.toLowerCase().includes('confirm your email') || message.toLowerCase().includes('email address')) {
        setEmailNotConfirmed(true)
      } else if (message.toLowerCase().includes('locked')) {
        setAccountLocked(true)
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) return
    setIsResending(true)
    try {
      await authService.resendConfirmation(formData.email)
      toast.success(t('auth.resend_confirmation_sent'))
      setEmailNotConfirmed(false)
    } catch {
      toast.error(t('auth.resend_confirmation_failed'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout activePage="login">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{t('auth.welcome_back')}</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {t('auth.sign_in_description')}
        </p>

        {/* Email not confirmed banner */}
        {emailNotConfirmed && (
          <div className="mb-5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 animate-slide-up">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {t('auth.email_not_confirmed_banner')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.resend_confirmation_hint')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      {t('auth.sending')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      {t('auth.resend_confirmation')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Account locked banner */}
        {accountLocked && (
          <div className="mb-5 p-4 rounded-xl border border-destructive/30 bg-destructive/10 animate-slide-up">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">
                  {t('auth.account_locked')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.account_locked_hint')}
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block mt-3 text-xs font-medium text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
                >
                  {t('auth.forgot_password', 'Forgot password?')}
                </Link>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground font-medium text-sm">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@airpro.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (emailNotConfirmed) setEmailNotConfirmed(false)
                  if (accountLocked) setAccountLocked(false)
                }}
                required
                className="pl-10 h-11 bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">{t('auth.password')}</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                {t('auth.forgot_password', 'Forgot password?')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pl-10 h-11 bg-background border-border"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('auth.signing_in')}
              </>
            ) : (
              <>
                {t('auth.sign_in')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {t('auth.dont_have_account')}{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
