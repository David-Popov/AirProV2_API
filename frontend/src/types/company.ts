
import type { CompanyType } from './common';

export interface Company {
  id: string;
  company_name: string;
  company_type: CompanyType;
  bulstat?: string | null;
  vat_number?: string | null;
  is_vat_registered: boolean;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  trial_end_date?: string | null;
  is_subscription_active?: boolean | null;
  last_activity_at?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CompanyUser {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  phone_number?: string | null;
  roles: string[];
  is_active: boolean;
}

export interface CreateCompanyRequest {
  company_name: string;
  company_type: CompanyType;
  bulstat?: string | null;
  vat_number?: string | null;
  is_vat_registered?: boolean;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CreateCompanyUserRequest {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  phone_number?: string | null;
  address?: string | null;
  role?: string;
}

export interface UpdateSubscriptionRequest {
  subscription_plan: string;
  subscription_status: string;
  is_subscription_active: boolean;
}

export type SubscriptionPlan = 'FreeTrial' | 'Premium' | 'Free';
export type SubscriptionStatus = 'Trial' | 'Active' | 'Expired' | 'Cancelled' | 'Suspended';

export const SUBSCRIPTION_PLANS: { value: Exclude<SubscriptionPlan, 'FreeTrial'>; label: string; description: string }[] = [
  { value: 'Free', label: 'Free', description: 'Up to 2 active employees' },
  { value: 'Premium', label: 'Premium', description: 'Unlimited employees' },
];

export const SUBSCRIPTION_STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'Trial', label: 'Trial' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Suspended', label: 'Suspended' },
];
