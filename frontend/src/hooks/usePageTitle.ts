import { useEffect } from 'react'

const BASE_TITLE = 'AirPro Management | HVAC Service Platform'

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | AirPro` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [pageTitle])
}
