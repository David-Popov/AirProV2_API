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
  error_code: string;
  error_name?: string | null;
  description?: string | null;
  air_conditioner_id: string;
  solution?: string | null;
  severity?: string | null;
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

export interface CreateErrorCodeRequest {
  error_code: string;
  error_name?: string | null;
  description?: string | null;
  air_conditioner_id: string;
  solution?: string | null;
  severity?: string | null;
}

export interface UpdateErrorCodeRequest extends Partial<Omit<CreateErrorCodeRequest, 'air_conditioner_id'>> {}


