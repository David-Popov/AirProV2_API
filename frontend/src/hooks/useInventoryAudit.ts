import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { inventoryAuditService } from '@/services'

export function useItemAuditLog(itemId: string, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: queryKeys.inventoryAudit.byItem(itemId, page, pageSize),
    queryFn: () => inventoryAuditService.getItemHistory(itemId, page, pageSize),
    enabled: !!itemId,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useRecentAuditActivity(count: number = 6) {
  return useQuery({
    queryKey: queryKeys.inventoryAudit.recent(count),
    queryFn: () => inventoryAuditService.getRecentActivity(count),
    staleTime: 60 * 1000, // 1 minute
  })
}
