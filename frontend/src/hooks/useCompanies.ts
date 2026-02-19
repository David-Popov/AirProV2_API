import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { companyService } from '@/services'
import type { CreateCompanyRequest, UpdateCompanyRequest, CreateCompanyUserRequest, UpdateSubscriptionRequest } from '@/types'

export function useCompanies(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.companies.list(page, pageSize),
    queryFn: () => companyService.getAll(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companyService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyRequest }) =>
      companyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => companyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
    },
  })
}

export function useCreateCompanyUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CreateCompanyUserRequest }) =>
      companyService.createUser(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: UpdateSubscriptionRequest }) =>
      companyService.updateSubscription(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stripe.status() })
    },
  })
}

export function useRenewSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId: string) => companyService.renewSubscription(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stripe.status() })
    },
  })
}
