import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { adminService } from '@/services/admin'
import type {
  AdminCompanyFilter,
  AdminUpdateSubscription,
  AdminUserFilter,
  AdminUpdateUser,
  AdminChangePassword,
  AdminChangeRole,
  AdminMontageFilter,
  AdminCreateMontage,
} from '@/types/admin'

export function useAdminCompanies(filter: AdminCompanyFilter) {
  return useQuery({
    queryKey: queryKeys.admin.companies(filter),
    queryFn: () => adminService.getCompanies(filter),
  })
}

export function useAdminUpdateCompanySubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateSubscription }) =>
      adminService.updateCompanySubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allCompanies })
    },
  })
}

export function useAdminDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allCompanies })
    },
  })
}

export function useAdminRestoreCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.restoreCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allCompanies })
    },
  })
}

export function useAdminUsers(filter: AdminUserFilter) {
  return useQuery({
    queryKey: queryKeys.admin.users(filter),
    queryFn: () => adminService.getUsers(filter),
  })
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUser }) =>
      adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allUsers })
    },
  })
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminChangePassword }) =>
      adminService.changeUserPassword(id, data),
  })
}

export function useAdminChangeRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminChangeRole }) =>
      adminService.changeUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allUsers })
    },
  })
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allUsers })
    },
  })
}

export function useAdminRestoreUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allUsers })
    },
  })
}

export function useAdminMontages(filter: AdminMontageFilter) {
  return useQuery({
    queryKey: queryKeys.admin.montages(filter),
    queryFn: () => adminService.getMontages(filter),
  })
}

export function useAdminCreateMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminCreateMontage) => adminService.createMontage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allMontages })
    },
  })
}

export function useAdminUpdateMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminCreateMontage }) =>
      adminService.updateMontage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allMontages })
    },
  })
}

export function useAdminDeleteMontage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteMontage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.allMontages })
    },
  })
}
