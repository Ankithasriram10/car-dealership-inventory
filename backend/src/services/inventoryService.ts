import { z } from 'zod';
import { VehicleRepository } from '../repositories/vehicleRepository';
import { badRequest, conflict, notFound } from '../errors';
import { Vehicle } from '../types';

const positiveInt = (label: string) =>
  z.number({ error: `${label} must be a number` }).int(`${label} must be a whole number`).positive(`${label} must be at least 1`);

const purchaseSchema = z.object({ quantity: positiveInt('Quantity').default(1) });
const restockSchema = z.object({ quantity: positiveInt('Quantity') });

/** Stock movements: purchases decrease quantity, restocks increase it. */
export class InventoryService {
  constructor(private readonly vehicles: VehicleRepository) {}

  purchase(id: number, input: unknown): Vehicle {
    const parsed = purchaseSchema.safeParse(input ?? {});
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    const vehicle = this.requireVehicle(id);
    if (!this.vehicles.decrementIfAvailable(id, parsed.data.quantity)) {
      throw conflict(`Insufficient stock: ${vehicle.quantity} available`);
    }
    return this.requireVehicle(id);
  }

  restock(id: number, input: unknown): Vehicle {
    const parsed = restockSchema.safeParse(input ?? {});
    if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
    this.requireVehicle(id);
    this.vehicles.increment(id, parsed.data.quantity);
    return this.requireVehicle(id);
  }

  private requireVehicle(id: number): Vehicle {
    const v = this.vehicles.findById(id);
    if (!v) throw notFound('Vehicle not found');
    return v;
  }
}
