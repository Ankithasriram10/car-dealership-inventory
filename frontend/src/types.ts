export type Role = 'user' | 'admin';

export interface User { id: number; name: string; email: string; role: Role }

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/** Payload for creating or updating a vehicle. */
export type VehicleInput = Omit<Vehicle, 'id'>;

/** Search form values are kept as strings so empty inputs stay empty. */
export interface SearchFilterValues {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: SearchFilterValues = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };
