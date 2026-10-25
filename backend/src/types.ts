/** Shared domain types for the dealership API. */
export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserRecord extends User {
  passwordHash: string;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface TokenPayload {
  sub: number;
  role: Role;
}
