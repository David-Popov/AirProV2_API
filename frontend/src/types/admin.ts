// Admin types for frontend
export interface AdminCompanyFilter {
  name?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  subscriptionStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminCompany {
  id: string;
  companyName: string;
  companyType: string;
  bulstat?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isDeleted: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndDate?: string;
  subscriptionCurrentPeriodEnd?: string;
  isSubscriptionActive?: boolean;
  userCount: number;
  montageCount: number;
  createdAt: string;
}

export interface AdminUpdateSubscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndDate?: string;
  subscriptionCurrentPeriodEnd?: string;
  isSubscriptionActive?: boolean;
}

export interface AdminUserFilter {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  companyId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  address?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  companyId?: string;
  companyName?: string;
  roles: string[];
  createdAt: string;
}

export interface AdminUpdateUser {
  firstName: string;
  middleName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface AdminChangePassword {
  newPassword: string;
  sendEmailNotification: boolean;
}

export interface AdminChangeRole {
  newRole: string;
}

export interface AdminMontageFilter {
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  userName?: string;
  companyId?: string;
  status?: number;
  paymentStatus?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminMontage {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  installationDate: string;
  completionDate?: string;
  status: string;
  paymentStatus: string;
  totalPrice?: number;
  paidAmount?: number;
  notes?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  companyId?: string;
  companyName?: string;
  airConditionerId?: string;
  airConditionerBrand?: string;
  airConditionerModel?: string;
  createdAt: string;
}

export interface AdminCreateMontage {
  companyId?: string;
  userId?: string;
  airConditionerId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  installationDate: string;
  completionDate?: string;
  status: number;
  paymentStatus: number;
  totalPrice?: number;
  paidAmount?: number;
  notes?: string;
  indoorUnitSerial?: string;
  outdoorUnitSerial?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: 'Trial', label: 'Trial' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Suspended', label: 'Suspended' },
];

export const SUBSCRIPTION_PLAN_OPTIONS = [
  { value: 'FreeTrial', label: 'Free Trial' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Free', label: 'Free' },
];

export const ROLE_OPTIONS = [
  { value: 'Manager', label: 'Manager' },
  { value: 'User', label: 'User' },
];
