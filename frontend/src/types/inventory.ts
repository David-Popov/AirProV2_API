// Inventory Types

export type UnitOfMeasure = 
  | 'Pieces'
  | 'Meters'
  | 'Centimeters'
  | 'Kilograms'
  | 'Grams'
  | 'Liters'
  | 'Milliliters'
  | 'Rolls'
  | 'Boxes'
  | 'Sets';

export const UNIT_OF_MEASURE_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'Pieces', label: 'Pieces' },
  { value: 'Meters', label: 'Meters' },
  { value: 'Centimeters', label: 'Centimeters' },
  { value: 'Kilograms', label: 'Kilograms' },
  { value: 'Grams', label: 'Grams' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Milliliters', label: 'Milliliters' },
  { value: 'Rolls', label: 'Rolls' },
  { value: 'Boxes', label: 'Boxes' },
  { value: 'Sets', label: 'Sets' },
];

export interface InventoryItem {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  quantity: number;
  unit_of_measure: string;
  min_quantity?: number | null;
  unit_price?: number | null;
  supplier?: string | null;
  location?: string | null;
  notes?: string | null;
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateInventoryItemRequest {
  company_id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  quantity: number;
  unit_of_measure: string;
  min_quantity?: number | null;
  unit_price?: number | null;
  supplier?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface UpdateInventoryItemRequest {
  name: string;
  description?: string | null;
  sku?: string | null;
  quantity: number;
  unit_of_measure: string;
  min_quantity?: number | null;
  unit_price?: number | null;
  supplier?: string | null;
  location?: string | null;
  notes?: string | null;
  is_active: boolean;
}

export interface AdjustInventoryQuantityRequest {
  adjustment_amount: number;
  reason?: string | null;
}
