import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/context'
import { authService } from '@/services'

interface ForcedPasswordChangeModalProps {
  isOpen: boolean
}

export function ForcedPasswordChangeModal({ isOpen }: ForcedPasswordChangeModalProps) {
  const { t } = useTranslation()
  const { refreshUser } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      toast.error(t('auth.password_min_length', 'Password must be at least 8 characters.'))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwords_no_match', 'Passwords do not match.'))
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(newPassword, confirmPassword)
      toast.success(t('auth.password_changed', 'Your password has been updated.'))
      setNewPassword('')
      setConfirmPassword('')
      await refreshUser()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error', 'Something went wrong'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="bg-card border-border sm:max-w-106.25"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('auth.temp_password_title', 'Set a New Password')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {t('auth.temp_password_description', 'An administrator set a temporary password for your account. Please choose a new password to continue.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>{t('auth.new_password', 'New Password')}</Label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
          </div>
          <div>
            <Label>{t('auth.confirm_password', 'Confirm Password')}</Label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('auth.update_password', 'Update Password')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
