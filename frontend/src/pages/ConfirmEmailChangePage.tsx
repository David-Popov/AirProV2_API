import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { authService } from '@/services';
import { translateApiError } from '@/lib/apiErrors';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmailChangePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const userId = searchParams.get('userId');
  const newEmail = searchParams.get('newEmail');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmChange = async () => {
      if (!userId || !newEmail || !token) {
        setStatus('error');
        setErrorMessage(t('auth.invalid_email_change_link', 'Invalid email change link.'));
        return;
      }

      try {
        await authService.confirmEmailChange(userId, newEmail, token);
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const message = err instanceof Error ? translateApiError(err.message) : t('auth.email_change_failed', 'Email change failed. The link may have expired.');
        setErrorMessage(message);
      }
    };

    confirmChange();
  }, [userId, newEmail, token, t]);

  return (
    <AuthLayout activePage="login">
      <div className="text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.confirming_email_change', 'Confirming email change...')}</h2>
            <p className="text-muted-foreground">{t('auth.please_wait', 'Please wait a moment.')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.email_changed', 'Email Updated!')}</h2>
            <p className="text-muted-foreground">
              {t('auth.email_changed_message', 'Your email has been updated to')} <strong>{newEmail}</strong>.
              {' '}{t('auth.please_login_again', 'Please log in again with your new email.')}
            </p>
            <Link to="/login">
              <Button className="w-full mt-4">{t('auth.go_to_login', 'Go to Login')}</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.email_change_failed_title', 'Email Change Failed')}</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full mt-4">{t('auth.go_to_login', 'Go to Login')}</Button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
