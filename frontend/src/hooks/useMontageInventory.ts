import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { montageInventoryService } from '@/services'
import type { AddMaterialRequest } from '@/services/montage-inventory'

export function useMontageInventoryMaterials(montageId: string) {
  return useQuery({
    queryKey: queryKeys.montageInventory.byMontage(montageId),
    queryFn: () => montageInventoryService.getMaterials(montageId),
    enabled: !!montageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddMaterials() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ montageId, materials }: { montageId: string; materials: AddMaterialRequest[] }) =>
      montageInventoryService.addMaterials(montageId, materials),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montageInventory.byMontage(variables.montageId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useUpdateMaterialQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ materialId, quantityUsed }: { materialId: string; montageId: string; quantityUsed: number }) =>
      montageInventoryService.updateQuantity(materialId, quantityUsed),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montageInventory.byMontage(variables.montageId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}

export function useRemoveMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ materialId }: { materialId: string; montageId: string }) =>
      montageInventoryService.removeMaterial(materialId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.montageInventory.byMontage(variables.montageId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
    },
  })
}
