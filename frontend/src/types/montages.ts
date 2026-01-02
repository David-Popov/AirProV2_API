import type { AirConditioner } from './air-conditioner';

export interface Montage {
  id: string;
  company_id?: string | null;
  user_id?: string | null;
  air_conditioner_id?: string | null;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_city?: string | null;
  installation_date: string; // DateOnly as string
  completion_date?: string | null; // DateOnly as string
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
}

export interface CreateMontageRequest {
  air_conditioner_id?: string | null;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  client_city?: string | null;
  installation_date: string;
  status?: string | null;
  total_price?: number | null;
  notes?: string | null;
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
