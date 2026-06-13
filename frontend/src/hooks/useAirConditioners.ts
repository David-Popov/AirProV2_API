import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { airConditionerService } from '@/services'
import type { CreateAirConditionerRequest, UpdateAirConditionerRequest, CreateErrorCodeRequest, UpdateErrorCodeRequest } from '@/types'

const LONG_STALE_TIME = 30 * 60 * 1000

export function useAirConditioners(page: number, pageSize: number, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.airConditioners.list(page, pageSize, filters),
    queryFn: () => airConditionerService.getAll(page, pageSize, filters),
    staleTime: LONG_STALE_TIME,
  })
}

export function useAirConditioner(id: string) {
  return useQuery({
    queryKey: queryKeys.airConditioners.detail(id),
    queryFn: () => airConditionerService.getById(id),
    enabled: !!id,
    staleTime: LONG_STALE_TIME,
  })
}

export function useAirConditionerErrorCodes(airConditionerId: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.airConditioners.errorCodes(airConditionerId, page, pageSize),
    queryFn: () => airConditionerService.getErrorCodes(airConditionerId, page, pageSize),
    enabled: !!airConditionerId,
    staleTime: LONG_STALE_TIME,
  })
}

export function useAllErrorCodes(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.airConditioners.allErrorCodes(page, pageSize),
    queryFn: () => airConditionerService.getAllErrorCodes(page, pageSize),
    staleTime: LONG_STALE_TIME,
  })
}

export function useCreateAirConditioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAirConditionerRequest) => airConditionerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}

export function useUpdateAirConditioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAirConditionerRequest }) =>
      airConditionerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}

export function useDeleteAirConditioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => airConditionerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}

export function useCreateErrorCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateErrorCodeRequest) => airConditionerService.createErrorCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}

export function useUpdateErrorCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateErrorCodeRequest }) =>
      airConditionerService.updateErrorCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}

export function useDeleteErrorCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => airConditionerService.deleteErrorCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.airConditioners.all })
    },
  })
}
