import type { AirConditioner } from './air-conditioner';

export interface MontageInventoryItem {
  id: string;
  montage_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_price_at_time?: number;
  notes?: string;
  created_at: string;
  item_name?: string;
  item_sku?: string;
  unit_of_measure?: string;
}

export interface MontagePhoto {
  id: string;
  montage_id: string;
  file_name: string;
  original_file_name: string;
  content_type: string;
  file_size: number;
  url: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface PhotoValidationInfo {
  maxPhotosPerMontage: number;
  maxFileSizeMB: number;
  maxFileSizeBytes: number;
  allowedContentTypes: string[];
  allowedExtensions: string[];
}

export interface AssignedUser {
  id: string;
  full_name: string;
}

export interface Montage {
  id: string;
  company_id?: string | null;
  user_id?: string | null;
  assigned_user_ids?: string[];
  assigned_users?: AssignedUser[];
  air_conditioner_id?: string | null;
  custom_ac_brand?: string | null;
  custom_ac_model?: string | null;
  custom_ac_kilowatts?: number | null;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_city?: string | null;
  installation_date: string; // DateOnly as string
  completion_date?: string | null; // DateOnly as string
  next_maintenance_date?: string | null; // DateOnly as string
  status?: string | null;
  indoor_unit_serial?: string | null;
  outdoor_unit_serial?: string | null;
  total_price?: number | null;
  paid_amount?: number | null;
  payment_status?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  air_conditioner?: AirConditioner | null;
  used_materials?: MontageInventoryItem[];
  photos?: MontagePhoto[];
}

export interface CreateMontageRequest {
  air_conditioner_id?: string | null;
  custom_ac_brand?: string | null;
  custom_ac_model?: string | null;
  custom_ac_kilowatts?: number | null;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_city?: string | null;
  installation_date: string;
  completion_date?: string | null;
  status?: string | null;
  total_price?: number | null;
  notes?: string | null;
  assigned_user_ids?: string[];
}

export interface UpdateMontageRequest extends Partial<CreateMontageRequest> {
  completion_date?: string | null;
  indoor_unit_serial?: string | null;
  outdoor_unit_serial?: string | null;
  paid_amount?: number | null;
  payment_status?: string | null;
}

export const MONTAGE_STATUS_OPTIONS = [
  { value: 'Planned', label: 'Planned' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Canceled', label: 'Cancelled' },
  { value: 'Overdue', label: 'Overdue' }
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'NotPaid', label: 'Not Paid' },
  { value: 'PartiallyPaid', label: 'Partially Paid' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' }
];
