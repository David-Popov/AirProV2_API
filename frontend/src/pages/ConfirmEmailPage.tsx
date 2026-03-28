import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';
import { CheckCircle2, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';

export default function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!userId || !token) {
        setStatus('error');
        setErrorMessage(t('auth.invalid_confirmation_link', 'Invalid confirmation link.'));
        return;
      }

      try {
        await authService.confirmEmail(userId, token);
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const message = err instanceof Error ? err.message : t('auth.confirmation_failed', 'Email confirmation failed. The link may have expired.');
        setErrorMessage(message);
      }
    };

    confirmEmail();
  }, [userId, token, t]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await authService.resendConfirmation(resendEmail);
      setResendSent(true);
      toast.success(t('auth.resend_confirmation_sent'));
    } catch {
      toast.error(t('auth.resend_confirmation_failed'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout activePage="login">
      <div className="text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.confirming_email', 'Confirming your email...')}</h2>
            <p className="text-muted-foreground">{t('auth.please_wait', 'Please wait a moment.')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mx-auto">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">{t('auth.email_confirmed', 'Email Confirmed!')}</h2>
            <p className="text-muted-foreground">
              {t('auth.email_confirmed_message', 'Your email has been confirmed. You can now log in to your account.')}
            </p>
            <Link to="/login">
              <Button className="w-full mt-4 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                {t('auth.go_to_login', 'Go to Login')}
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mx-auto">
              <XCircle className="w-9 h-9 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">{t('auth.confirmation_failed_title', 'Confirmation Failed')}</h2>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>

            {!resendSent ? (
              <div className="mt-2 text-left space-y-4 border border-border rounded-xl p-4 bg-muted/30">
                <p className="text-sm font-medium text-foreground">
                  {t('auth.resend_confirmation_hint', 'Enter your email address to receive a new confirmation link.')}
                </p>
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="resend-email" className="text-sm font-medium">{t('auth.email', 'Email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="john@airpro.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    disabled={isResending || !resendEmail}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('auth.sending', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('auth.send_new_link', 'Send New Link')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-2 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('auth.resend_confirmation_sent', 'Confirmation email sent! Please check your inbox.')}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">{t('auth.go_to_login', 'Go to Login')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
