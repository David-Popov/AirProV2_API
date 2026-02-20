export interface AirConditioner {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  kilowatts?: number | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  
  pipe_size_liquid?: string | null;
  pipe_size_gas?: string | null;
  max_pipe_length?: number | null;
  max_height_difference?: number | null;
  
  refrigerant_type?: string | null;
  factory_refrigerant_charge?: number | null;
  
  power_supply_location?: string | null;
  cable_section?: string | null;
  recommended_fuse?: number | null;
  
  indoor_dimensions?: string | null;
  outdoor_dimensions?: string | null;
  weight_indoor?: number | null;
  weight_outdoor?: number | null;
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
  
  pipe_size_liquid?: string | null;
  pipe_size_gas?: string | null;
  max_pipe_length?: number | null;
  max_height_difference?: number | null;
  
  refrigerant_type?: string | null;
  factory_refrigerant_charge?: number | null;
  
  power_supply_location?: string | null;
  cable_section?: string | null;
  recommended_fuse?: number | null;
  
  indoor_dimensions?: string | null;
  outdoor_dimensions?: string | null;
  weight_indoor?: number | null;
  weight_outdoor?: number | null;
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


