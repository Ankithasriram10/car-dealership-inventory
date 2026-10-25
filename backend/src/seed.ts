/**
 * Seeds an admin account, a demo customer and a starter catalogue.
 * Safe to re-run: existing users/vehicles are left untouched.
 */
import { openDatabase } from './db';
import { loadConfig } from './config';
import { UserRepository } from './repositories/userRepository';
import { VehicleRepository } from './repositories/vehicleRepository';
import { hashPassword } from './services/passwordHasher';

async function main() {
  const db = openDatabase(loadConfig().dbPath);
  const users = new UserRepository(db);
  const vehicles = new VehicleRepository(db);

  const accounts = [
    { name: 'Dealership Admin', email: 'admin@dealership.com', password: 'Admin123!', role: 'admin' as const },
    { name: 'Demo Customer', email: 'customer@dealership.com', password: 'Customer123!', role: 'user' as const },
  ];
  for (const a of accounts) {
    if (!users.findByEmail(a.email)) {
      users.create({ name: a.name, email: a.email, passwordHash: await hashPassword(a.password), role: a.role });
      console.log(`created ${a.role}: ${a.email} / ${a.password}`);
    }
  }

  if (vehicles.findAll().length === 0) {
    const catalogue = [
      ['Toyota', 'Camry', 'Sedan', 28000, 5], ['Toyota', 'RAV4', 'SUV', 35500, 4],
      ['Honda', 'Civic', 'Sedan', 24500, 7], ['Honda', 'CR-V', 'SUV', 33000, 3],
      ['Ford', 'Mustang', 'Coupe', 45000, 2], ['Ford', 'F-150', 'Truck', 52000, 0],
      ['Tesla', 'Model 3', 'Electric', 42000, 6], ['Tesla', 'Model Y', 'Electric', 48500, 1],
      ['BMW', '3 Series', 'Sedan', 46000, 3], ['Jeep', 'Wrangler', 'SUV', 41000, 2],
      ['Chevrolet', 'Silverado', 'Truck', 49000, 4], ['Mazda', 'MX-5 Miata', 'Convertible', 31500, 2],
    ] as const;
    catalogue.forEach(([make, model, category, price, quantity]) =>
      vehicles.create({ make, model, category, price, quantity }));
    console.log(`seeded ${catalogue.length} vehicles`);
  }
  db.close();
}

main();
