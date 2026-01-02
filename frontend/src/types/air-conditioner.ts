export interface AirConditioner {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  kilowatts?: number | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
}

export interface ErrorCode {
  id: string;
  code: string;
  description: string;
  air_conditioner_id: string;
  // potentially other fields like solution, cause
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
