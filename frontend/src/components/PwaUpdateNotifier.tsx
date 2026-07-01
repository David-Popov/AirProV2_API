import { logger } from '@/lib/logger'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'

export function PwaUpdateNotifier() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      logger.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      toast.success(t('pwa.offline_ready'), {
        duration: 4000,
        onDismiss: () => setOfflineReady(false),
      })
    }
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (needRefresh) {
      toast.info(t('pwa.update_available'), {
        description: t('pwa.update_description'),
        duration: Infinity,
        action: {
          label: t('pwa.update_action'),
          onClick: () => {
            updateServiceWorker(true)
            setNeedRefresh(false)
          },
        },
        onDismiss: () => setNeedRefresh(false),
      })
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker])

  return null
}
