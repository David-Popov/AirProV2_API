import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
    } catch {
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <AuthLayout activePage="login">
      <div className="space-y-6">
        {!isSubmitted ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t('auth.forgot_password', 'Forgot Password')}</h2>
              <p className="text-muted-foreground">
                {t('auth.forgot_password_description', 'Enter your email address and we\'ll send you a link to reset your password.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.email_placeholder', 'Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t('auth.sending', 'Sending...')
                  : t('auth.send_reset_link', 'Send Reset Link')}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">{t('auth.check_your_email', 'Check Your Email')}</h2>
            <p className="text-muted-foreground">
              {t('auth.reset_link_sent', 'If an account exists with that email, we\'ve sent a password reset link. Please check your inbox.')}
            </p>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t('auth.back_to_login', 'Back to Login')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
