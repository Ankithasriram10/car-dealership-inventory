import { Db } from '../db';
import { Vehicle } from '../types';

export type NewVehicle = Omit<Vehicle, 'id'>;

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Escapes LIKE wildcards so user input is matched literally. */
const likeContains = (s: string) => `%${s.replace(/[\\%_]/g, '\\$&')}%`;

/** Persistence for vehicles. Only this class knows the vehicles table layout. */
export class VehicleRepository {
  constructor(private readonly db: Db) {}

  create(v: NewVehicle): Vehicle {
    const info = this.db
      .prepare('INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)')
      .run(v.make, v.model, v.category, v.price, v.quantity);
    return { id: Number(info.lastInsertRowid), ...v };
  }

  findById(id: number): Vehicle | undefined {
    return this.db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as Vehicle | undefined;
  }

  findAll(): Vehicle[] {
    return this.db.prepare('SELECT * FROM vehicles ORDER BY id').all() as Vehicle[];
  }

  /** Filters are combined with AND; make/model are partial matches, category is an exact (case-insensitive) match. */
  search(f: SearchFilters): Vehicle[] {
    const where: string[] = [];
    const params: (string | number)[] = [];
    if (f.make) { where.push("make LIKE ? ESCAPE '\\'"); params.push(likeContains(f.make)); }
    if (f.model) { where.push("model LIKE ? ESCAPE '\\'"); params.push(likeContains(f.model)); }
    if (f.category) { where.push('category = ? COLLATE NOCASE'); params.push(f.category); }
    if (f.minPrice !== undefined) { where.push('price >= ?'); params.push(f.minPrice); }
    if (f.maxPrice !== undefined) { where.push('price <= ?'); params.push(f.maxPrice); }
    const sql = `SELECT * FROM vehicles ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id`;
    return this.db.prepare(sql).all(...params) as Vehicle[];
  }

  update(id: number, patch: Partial<NewVehicle>): Vehicle | undefined {
    const current = this.findById(id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    this.db
      .prepare('UPDATE vehicles SET make=?, model=?, category=?, price=?, quantity=? WHERE id=?')
      .run(next.make, next.model, next.category, next.price, next.quantity, id);
    return next;
  }

  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM vehicles WHERE id = ?').run(id).changes > 0;
  }

  /**
   * Atomically removes stock. The WHERE clause makes the check-and-decrement a single
   * statement, so concurrent buyers can never push quantity below zero.
   */
  decrementIfAvailable(id: number, amount: number): boolean {
    return this.db
      .prepare('UPDATE vehicles SET quantity = quantity - ? WHERE id = ? AND quantity >= ?')
      .run(amount, id, amount).changes > 0;
  }

  increment(id: number, amount: number): boolean {
    return this.db.prepare('UPDATE vehicles SET quantity = quantity + ? WHERE id = ?').run(amount, id).changes > 0;
  }
}
