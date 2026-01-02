// Common/Shared Types

// Company Types
export type CompanyType = 
  | 'SoleProprietorship'
  | 'LLC'
  | 'LTD'
  | 'JSC'
  | 'Partnership'
  | 'LimitedPartnership'
  | 'Cooperative'
  | 'Other';

export const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: 'SoleProprietorship', label: 'Sole Proprietorship (ЕТ)' },
  { value: 'LLC', label: 'LLC (ООД)' },
  { value: 'LTD', label: 'LTD (ЕООД)' },
  { value: 'JSC', label: 'JSC (АД)' },
  { value: 'Partnership', label: 'Partnership (СД)' },
  { value: 'LimitedPartnership', label: 'Limited Partnership (КД)' },
  { value: 'Cooperative', label: 'Cooperative (Кооперация)' },
  { value: 'Other', label: 'Other (Друго)' },
];

// Pagination
export interface PagedList<T> {
  items: T[];
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

// API Response types
export interface ApiError {
  message?: string;
  errors?: string[];
}
