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

export interface AppConfig {
  dbPath: string;
  jwtSecret: string;
}

/** Composition root: wires repositories -> services -> routes. */
export function createApp(config: AppConfig) {
  const db = openDatabase(config.dbPath);
  const tokens = new TokenService(config.jwtSecret);
  const users = new UserRepository(db);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes(new AuthService(users, tokens)));
  app.use('/api/vehicles', authenticate(tokens), vehicleRoutes());

  app.use(errorHandler);
  return { app, db };
}
