import cors from 'cors';
import express from 'express';
import { openDatabase } from './db';
import { UserRepository } from './repositories/userRepository';
import { AuthService } from './services/authService';
import { TokenService } from './services/tokenService';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { vehicleRoutes } from './routes/vehicleRoutes';
import { VehicleRepository } from './repositories/vehicleRepository';
import { InventoryService } from './services/inventoryService';
import { inventoryRoutes } from './routes/inventoryRoutes';
import { VehicleService } from './services/vehicleService';

export interface AppConfig {
  dbPath: string;
  jwtSecret: string;
}

/** Composition root: wires repositories -> services -> routes. */
export function createApp(config: AppConfig) {
  const db = openDatabase(config.dbPath);
  const tokens = new TokenService(config.jwtSecret);
  const users = new UserRepository(db);

  const vehicleRepo = new VehicleRepository(db);
  const vehicleService = new VehicleService(vehicleRepo);
  const inventoryService = new InventoryService(vehicleRepo);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes(new AuthService(users, tokens)));
  const requireAuth = authenticate(tokens);
  app.use('/api/vehicles', requireAuth, vehicleRoutes(vehicleService));
  app.use('/api/vehicles', requireAuth, inventoryRoutes(inventoryService));

  app.use(errorHandler);
  return { app, db };
}
