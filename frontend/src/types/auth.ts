
export interface MessageResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  phone_number?: string | null;
  address?: string | null;
  
  company_name: string;
  company_type: string;
  bulstat?: string | null;
  vat_number?: string | null;
  is_vat_registered?: boolean | null;
  company_address?: string | null;
  company_city?: string | null;
  company_postal_code?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  token_expiration: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  phone_number?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  trial_end_date?: string | null;
  has_used_trial?: boolean;
  roles: string[];
}

export interface CreateEmployeeRequest {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  phone_number?: string | null;
  address?: string | null;
}

export interface Employee {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  phone_number?: string | null;
  address?: string | null;
  roles: string[];
  is_active: boolean;
  created_at?: string | null;
}

export interface EmployeeLimits {
  current_count: number;
  max_count: number;
  can_add_more: boolean;
  subscription_plan: string;
}
