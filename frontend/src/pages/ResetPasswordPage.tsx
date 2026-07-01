import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';
import { translateApiError } from '@/lib/apiErrors';
import { toast } from 'sonner';
import { KeyRound, XCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  if (!email || !token) {
    return (
      <AuthLayout activePage="login">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">{t('auth.invalid_reset_link', 'Invalid Reset Link')}</h2>
          <p className="text-muted-foreground">
            {t('auth.invalid_reset_link_message', 'This password reset link is invalid or has expired.')}
          </p>
          <Link to="/forgot-password">
            <Button variant="outline" className="mt-2">{t('auth.request_new_link', 'Request a New Link')}</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwords_dont_match', 'Passwords do not match.'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.password_too_short', 'Password must be at least 6 characters.'));
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(email, token, newPassword);
      toast.success(t('auth.password_reset_success', 'Password reset successfully!'));
      navigate('/login', { state: { message: t('auth.password_reset_success', 'Password reset successfully! You can now log in with your new password.') } });
    } catch (err: unknown) {
      const message = err instanceof Error ? translateApiError(err.message) : t('auth.reset_failed', 'Failed to reset password. The link may have expired.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout activePage="login">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t('auth.reset_password', 'Reset Password')}</h2>
          <p className="text-muted-foreground">
            {t('auth.reset_password_description', 'Enter your new password below.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('auth.new_password', 'New Password')}</Label>
            <PasswordInput
              id="newPassword"
              placeholder={t('auth.new_password_placeholder', 'Enter new password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirm_password', 'Confirm Password')}</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder={t('auth.confirm_password_placeholder', 'Confirm new password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t('auth.resetting', 'Resetting...')
              : t('auth.reset_password_button', 'Reset Password')}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            {t('auth.back_to_login', 'Back to Login')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
