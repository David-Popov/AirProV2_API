import { useQuery, useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { stripeService } from '@/services'

const LONG_STALE_TIME = 30 * 60 * 1000

export function useStripeConfig() {
  return useQuery({
    queryKey: queryKeys.stripe.config(),
    queryFn: () => stripeService.getConfig(),
    staleTime: LONG_STALE_TIME,
  })
}

export function useStripePlan() {
  return useQuery({
    queryKey: queryKeys.stripe.plan(),
    queryFn: () => stripeService.getPlan(),
    staleTime: LONG_STALE_TIME,
  })
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: queryKeys.stripe.status(),
    queryFn: () => stripeService.getSubscriptionStatus(),
    staleTime: 30 * 1000,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: () => stripeService.createCheckoutSession(),
  })
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => stripeService.createPortalSession(),
  })
}

export function useReturnToFreePlan() {
  return useMutation({
    mutationFn: () => stripeService.returnToFreePlan(),
  })
}
