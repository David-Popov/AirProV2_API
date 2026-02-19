import type { MontageFilters } from '@/services/montages'
import type { AdminCompanyFilter, AdminUserFilter, AdminMontageFilter } from '@/types/admin'

export const queryKeys = {
  montages: {
    all: ['montages'] as const,
    list: (page: number, pageSize: number, filters?: MontageFilters) =>
      ['montages', 'list', { page, pageSize, ...filters }] as const,
    detail: (id: string) => ['montages', id] as const,
    byUser: (userId: string, page: number, pageSize: number) =>
      ['montages', 'user', userId, { page, pageSize }] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (page: number, pageSize: number) =>
      ['inventory', 'list', { page, pageSize }] as const,
    search: (term: string, page: number, pageSize: number) =>
      ['inventory', 'search', { term, page, pageSize }] as const,
    lowStock: (page: number, pageSize: number) =>
      ['inventory', 'low-stock', { page, pageSize }] as const,
    detail: (id: string) => ['inventory', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: () => ['employees', 'list'] as const,
    detail: (id: string) => ['employees', id] as const,
    limits: () => ['employees', 'limits'] as const,
  },
  airConditioners: {
    all: ['air-conditioners'] as const,
    list: (page: number, pageSize: number, filters?: Record<string, any>) =>
      ['air-conditioners', 'list', { page, pageSize, ...filters }] as const,
    detail: (id: string) => ['air-conditioners', id] as const,
    errorCodes: (id: string, page: number, pageSize: number) =>
      ['air-conditioners', id, 'error-codes', { page, pageSize }] as const,
    allErrorCodes: (page: number, pageSize: number) =>
      ['error-codes', { page, pageSize }] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (page: number, pageSize: number) =>
      ['companies', 'list', { page, pageSize }] as const,
    detail: (id: string) => ['companies', id] as const,
  },
  stripe: {
    config: () => ['stripe', 'config'] as const,
    plan: () => ['stripe', 'plan'] as const,
    status: () => ['stripe', 'status'] as const,
  },
  montagePhotos: {
    byMontage: (montageId: string) => ['montage-photos', montageId] as const,
    validationInfo: () => ['montage-photos', 'validation-info'] as const,
  },
  montageInventory: {
    byMontage: (montageId: string) => ['montage-inventory', montageId] as const,
  },
  inventoryAudit: {
    byItem: (itemId: string, page: number, pageSize: number) =>
      ['inventory-audit', 'item', itemId, { page, pageSize }] as const,
    recent: (count?: number) => ['inventory-audit', 'recent', { count }] as const,
  },
  problemReports: {
    all: ['problem-reports'] as const,
    list: () => ['problem-reports', 'list'] as const,
    categories: () => ['problem-reports', 'categories'] as const,
  },
  admin: {
    allCompanies: ['admin', 'companies'] as const,
    companies: (filter: AdminCompanyFilter) =>
      ['admin', 'companies', filter] as const,
    allUsers: ['admin', 'users'] as const,
    users: (filter: AdminUserFilter) =>
      ['admin', 'users', filter] as const,
    allMontages: ['admin', 'montages'] as const,
    montages: (filter: AdminMontageFilter) =>
      ['admin', 'montages', filter] as const,
  },
}
