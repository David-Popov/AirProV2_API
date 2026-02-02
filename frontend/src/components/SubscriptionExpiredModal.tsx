import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  AlertTriangle, 
  CreditCard, 
  Trash2, 
  LogOut,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/context'
import { companyService } from '@/services'

interface SubscriptionExpiredModalProps {
  isOpen: boolean
}

export function SubscriptionExpiredModal({ isOpen }: SubscriptionExpiredModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isRenewing, setIsRenewing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRenewSubscription = async () => {
    if (!user?.company_id) {
      toast.error(t('subscription.no_company', 'No company associated with your account'))
      return
    }
    
    setIsRenewing(true)
    try {
      await companyService.renewSubscription(user.company_id)
      toast.success(t('subscription.renewed_success', 'Subscription renewed successfully!'))
      // Refresh the page to update user data
      window.location.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setIsRenewing(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.company_id) {
      toast.error(t('subscription.no_company', 'No company associated with your account'))
      return
    }
    
    setIsDeleting(true)
    try {
      await companyService.delete(user.company_id)
      toast.success(t('subscription.account_deleted', 'Your account has been deleted'))
      logout()
      navigate('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="bg-card border-border sm:max-w-[500px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {t('subscription.expired_title', 'Subscription Expired')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {t('subscription.expired_description', 'Your subscription has expired. Please choose one of the following options to continue.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {/* Renew Subscription */}
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {t('subscription.renew_option', 'Renew Subscription')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('subscription.renew_description', 'Continue using all features by renewing your subscription.')}
                  </p>
                  <Button 
                    onClick={handleRenewSubscription}
                    disabled={isRenewing}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isRenewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('subscription.renew_button', 'Renew Now')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {t('subscription.delete_option', 'Delete Account')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('subscription.delete_description', 'Permanently delete your account and all associated data.')}
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-3"
                  >
                    {t('subscription.delete_button', 'Delete Account')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <LogOut className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {t('subscription.logout_option', 'Logout for Now')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('subscription.logout_description', 'Come back later to make a decision. Your data will be preserved.')}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="mt-3 border-border text-foreground hover:bg-muted"
                  >
                    {t('auth.logout', 'Logout')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('subscription.delete_confirm_title', 'Are you absolutely sure?')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('subscription.delete_confirm_description', 'This action cannot be undone. This will permanently delete your account, company, and all associated data including montages, inventory, and employee records.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('subscription.delete_confirm_button', 'Yes, delete my account')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
