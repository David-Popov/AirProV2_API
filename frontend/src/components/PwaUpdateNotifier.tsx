import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'

export function PwaUpdateNotifier() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      toast.success('AirPro is ready to work offline', {
        duration: 4000,
        onDismiss: () => setOfflineReady(false),
      })
    }
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (needRefresh) {
      toast.info('Update available', {
        description: 'A new version of AirPro is ready.',
        duration: Infinity,
        action: {
          label: 'Update',
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
