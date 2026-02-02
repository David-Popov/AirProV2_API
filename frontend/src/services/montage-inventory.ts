import { apiClient } from './api'
import type { MontageInventoryItem } from '@/types'

const BASE_URL = '/montageinventory'

export interface AddMaterialRequest {
  inventory_item_id: string;
  quantity_used: number;
  notes?: string;
}

export const montageInventoryService = {
  addMaterials: async (montageId: string, materials: AddMaterialRequest[]): Promise<MontageInventoryItem[]> => {
    return await apiClient.post<MontageInventoryItem[]>(`${BASE_URL}/${montageId}/materials`, { materials })
  },

  getMaterials: async (montageId: string): Promise<MontageInventoryItem[]> => {
    return await apiClient.get<MontageInventoryItem[]>(`${BASE_URL}/${montageId}/materials`)
  },

  updateQuantity: async (materialId: string, quantityUsed: number): Promise<void> => {
    return await apiClient.put<void>(`${BASE_URL}/materials/${materialId}`, { quantityUsed })
  },

  removeMaterial: async (materialId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/materials/${materialId}`)
  }
}
