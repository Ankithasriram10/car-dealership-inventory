import type { SearchFilterValues, User, Vehicle, VehicleInput } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '';

export const TOKEN_KEY = 'dealership.token';
export const USER_KEY = 'dealership.user';

/** Error thrown for any non-2xx response; `message` is the server's own message when available. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Single place that talks HTTP: attaches the token, parses JSON, normalises errors. */
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error ?? 'Something went wrong', res.status);
  return data as T;
}

export const api = {
  register: (input: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/api/auth/register', 'POST', input),
  login: (input: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', 'POST', input),

  listVehicles: () => request<Vehicle[]>('/api/vehicles'),
  searchVehicles: (filters: SearchFilterValues) => {
    const qs = new URLSearchParams();
    (['make', 'model', 'category', 'minPrice', 'maxPrice'] as const).forEach((k) => {
      if (filters[k].trim()) qs.set(k, filters[k].trim());
    });
    return request<Vehicle[]>(`/api/vehicles/search?${qs}`);
  },
  createVehicle: (v: VehicleInput) => request<Vehicle>('/api/vehicles', 'POST', v),
  updateVehicle: (id: number, v: Partial<VehicleInput>) => request<Vehicle>(`/api/vehicles/${id}`, 'PUT', v),
  deleteVehicle: (id: number) => request<void>(`/api/vehicles/${id}`, 'DELETE'),
  purchaseVehicle: (id: number, quantity = 1) => request<Vehicle>(`/api/vehicles/${id}/purchase`, 'POST', { quantity }),
  restockVehicle: (id: number, quantity: number) => request<Vehicle>(`/api/vehicles/${id}/restock`, 'POST', { quantity }),
};
