import { z } from 'zod';
import { NewVehicle, SearchFilters, VehicleRepository } from '../repositories/vehicleRepository';
import { badRequest, notFound } from '../errors';
import { Vehicle } from '../types';

const text = (label: string) => z.string().trim().min(1, `${label} is required`);

const baseFields = z.object({
  make: text('Make'),
  model: text('Model'),
  category: text('Category'),
  price: z.number({ error: 'Price must be a number' }).nonnegative('Price cannot be negative'),
  quantity: z.number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number').nonnegative('Quantity cannot be negative'),
});

// The default lives only on create; applying it to updates would silently reset stock.
const createSchema = baseFields.extend({ quantity: baseFields.shape.quantity.default(0) });

const updateSchema = baseFields.partial().refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

/** Query-string numbers arrive as text; reject anything that is not a finite number. */
const queryNumber = z.string().trim().min(1).transform(Number).refine(Number.isFinite, 'Must be a number').optional();
const searchSchema = z.object({
  make: z.string().trim().optional(),
  model: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: queryNumber,
  maxPrice: queryNumber,
}).refine((f) => f.minPrice === undefined || f.maxPrice === undefined || f.minPrice <= f.maxPrice,
  'minPrice cannot be greater than maxPrice');

/** Parses with zod and converts failures into a 400 with the first message. */
function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const r = schema.safeParse(input);
  if (!r.success) throw badRequest(r.error.issues[0].message);
  return r.data;
}

export function parseId(raw: unknown): number {
  const id = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (!Number.isInteger(id) || id <= 0) throw badRequest('Vehicle id must be a positive integer');
  return id;
}

/** Business rules for vehicle catalogue management. */
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  create(input: unknown): Vehicle {
    return this.vehicles.create(parse(createSchema, input) as NewVehicle);
  }

  list(): Vehicle[] {
    return this.vehicles.findAll();
  }

  get(id: number): Vehicle {
    return this.vehicles.findById(id) ?? (() => { throw notFound('Vehicle not found'); })();
  }

  search(query: unknown): Vehicle[] {
    return this.vehicles.search(parse(searchSchema, query) as SearchFilters);
  }

  update(id: number, input: unknown): Vehicle {
    const patch = parse(updateSchema, input);
    return this.vehicles.update(id, patch) ?? (() => { throw notFound('Vehicle not found'); })();
  }

  remove(id: number): void {
    if (!this.vehicles.delete(id)) throw notFound('Vehicle not found');
  }
}
