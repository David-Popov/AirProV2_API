import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { inventoryService } from '@/services'
import type { CreateInventoryItemRequest, UpdateInventoryItemRequest, AdjustInventoryQuantityRequest } from '@/types'

export function useInventory(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.inventory.list(page, pageSize),
    queryFn: () => inventoryService.getAll(page, pageSize),
  })
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  })
}

export function useInventorySearch(searchTerm: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.inventory.search(searchTerm, page, pageSize),
    queryFn: () => inventoryService.search(searchTerm, page, pageSize),
    enabled: searchTerm.length > 0,
  })
}

export function useLowStock(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(page, pageSize),
    queryFn: () => inventoryService.getLowStock(page, pageSize),
  })
}

export function useCanDeleteInventoryItem(id: string) {
  return useQuery({
    queryKey: [...queryKeys.inventory.detail(id), 'can-delete'] as const,
    queryFn: () => inventoryService.canDelete(id),
    enabled: !!id,
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemRequest }) =>
      inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useAdjustQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustInventoryQuantityRequest }) =>
      inventoryService.adjustQuantity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryAudit.recent() })
    },
  })
}

export function useUpdateInventoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      inventoryService.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useArchiveInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useRestoreInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}
