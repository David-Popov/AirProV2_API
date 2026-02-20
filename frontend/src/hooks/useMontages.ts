import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { montageService } from '@/services'
import type { MontageFilters } from '@/services/montages'
import type { CreateMontageRequest, UpdateMontageRequest } from '@/types'

export function useMontages(page: number, pageSize: number, filters?: MontageFilters) {
  return useQuery({
    queryKey: queryKeys.montages.list(page, pageSize, filters),
    queryFn: () => montageService.getAll(page, pageSize, filters),
  })
}

export function useEmployeeMontages(userId: string, page = 1, pageSize = 100) {
  return useQuery({
    queryKey: queryKeys.montages.byUser(userId, page, pageSize),
    queryFn: () => montageService.getByUserId(userId, page, pageSize),
    enabled: !!userId,
  })
}

export function useMontage(id: string) {
  return useQuery({
    queryKey: queryKeys.montages.detail(id),
    queryFn: () => montageService.getById(id),
    enabled: !!id,
  })
}

export function useMontageWithAC(id: string) {
  return useQuery({
    queryKey: queryKeys.montages.detail(id),
    queryFn: () => montageService.getByIdWithAC(id),
    enabled: !!id,
  })
}

export function useCreateMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMontageRequest) => montageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montages.all })
    },
  })
}

export function useUpdateMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMontageRequest }) =>
      montageService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montages.all })
    },
  })
}

export function useDeleteMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => montageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montages.all })
    },
  })
}

export function useUpdateMontageStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      montageService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montages.all })
    },
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, paymentStatus, paidAmount }: { id: string; paymentStatus: string; paidAmount?: number }) =>
      montageService.updatePaymentStatus(id, paymentStatus, paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montages.all })
    },
  })
}
