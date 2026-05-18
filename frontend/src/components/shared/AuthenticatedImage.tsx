import { useEffect, useMemo, type ReactNode, type ImgHTMLAttributes } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ImageOff } from 'lucide-react'
import { apiClient } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

interface AuthenticatedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Backend endpoint path (relative to apiClient base URL), e.g.
   * `/MontagePhotos/{id}/download`. Fetched as a Blob via the authenticated
   * api client and rendered as an Object URL.
   */
  endpoint: string
  fallback?: ReactNode
  errorFallback?: ReactNode
  containerClassName?: string
}

/**
 * Renders an image that lives behind a JWT-protected backend endpoint.
 *
 * The browser cannot attach `Authorization` headers to `<img src>` requests,
 * so we fetch the bytes via the authenticated apiClient, build an Object URL,
 * and render that. The fetch goes through TanStack Query so a thumbnail and
 * its lightbox share a single download and the cached blob survives a
 * close-and-reopen of the modal.
 */
export function AuthenticatedImage({
  endpoint,
  alt,
  fallback,
  errorFallback,
  className,
  containerClassName,
  ...imgProps
}: AuthenticatedImageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.montagePhotos.blob(endpoint),
    queryFn: () => apiClient.getBlob(endpoint),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  })

  // Same Blob reference is returned from the cache until invalidation, so
  // this memo recomputes only when the underlying data changes.
  const objectUrl = useMemo(
    () => (data ? URL.createObjectURL(data) : null),
    [data]
  )

  // Revoke the Object URL on unmount or when it changes, to avoid leaking
  // blob memory across page navigations.
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center w-full h-full bg-muted/30',
          containerClassName
        )}
      >
        {fallback ?? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
      </div>
    )
  }

  if (isError || !objectUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center w-full h-full bg-muted/30',
          containerClassName
        )}
      >
        {errorFallback ?? <ImageOff className="w-6 h-6 text-destructive" />}
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} {...imgProps} />
}
