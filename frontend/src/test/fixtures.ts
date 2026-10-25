import type { Vehicle, User } from '../types';

export const camry: Vehicle = { id: 1, make: 'Toyota', model: 'Camry', category: 'Sedan', price: 28000, quantity: 3 };
export const soldOut: Vehicle = { id: 2, make: 'Ford', model: 'F-150', category: 'Truck', price: 52000, quantity: 0 };
export const admin: User = { id: 9, name: 'Dealer Admin', email: 'admin@dealership.com', role: 'admin' };
export const customer: User = { id: 3, name: 'Casey Customer', email: 'casey@example.com', role: 'user' };

/** Minimal fetch Response stand-in. */
export const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);
