import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { authService } from '@/services';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

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
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.email_confirmed', 'Email Confirmed!')}</h2>
            <p className="text-muted-foreground">
              {t('auth.email_confirmed_message', 'Your email has been confirmed. You can now log in to your account.')}
            </p>
            <Link to="/login">
              <Button className="w-full mt-4">{t('auth.go_to_login', 'Go to Login')}</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.confirmation_failed_title', 'Confirmation Failed')}</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <div className="flex flex-col gap-2 mt-4">
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
