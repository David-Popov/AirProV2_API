import { Loader2, AlertTriangle } from 'lucide-react'
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

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
  confirmLabel: string
  cancelLabel: string
  isLoading?: boolean
  variant?: 'destructive' | 'warning'
  icon?: React.ComponentType<{ className?: string }>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  variant = 'destructive',
  icon: Icon,
}: ConfirmDialogProps) {
  const DefaultIcon = Icon || AlertTriangle

  const iconColor = variant === 'warning' ? 'text-orange-500' : 'text-destructive'
  const confirmClassName =
    variant === 'warning'
      ? 'bg-orange-500 text-white hover:bg-orange-600 border-none'
      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <DefaultIcon className={`w-5 h-5 ${iconColor}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-foreground">
                {itemName}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmClassName}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
