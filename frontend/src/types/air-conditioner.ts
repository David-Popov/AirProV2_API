export interface AirConditioner {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  kilowatts?: number | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  error_codes?: any[]; // Simplified for now
}

export interface CreateAirConditionerRequest {
  name: string;
  brand?: string | null;
  model?: string | null;
  kilowatts?: number | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
}

export interface UpdateAirConditionerRequest extends Partial<CreateAirConditionerRequest> {}
