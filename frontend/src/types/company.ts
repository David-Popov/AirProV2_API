
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
  warranty_default_months?: number | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  trial_end_date?: string | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
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
  warranty_default_months?: number | null;
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
  start_date?: string | null;
  end_date?: string | null;
}

// Subscription types
export type SubscriptionPlan = 'FreeTrial' | 'Basic' | 'Premium' | 'Enterprise';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled' | 'Trial';

export const SUBSCRIPTION_PLANS: { value: SubscriptionPlan; label: string; description: string }[] = [
  { value: 'FreeTrial', label: 'Free Trial', description: '14-day free trial' },
  { value: 'Basic', label: 'Basic', description: 'For small teams' },
  { value: 'Premium', label: 'Premium', description: 'For growing businesses' },
  { value: 'Enterprise', label: 'Enterprise', description: 'For large organizations' },
];

export const SUBSCRIPTION_STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Trial', label: 'Trial' },
];
