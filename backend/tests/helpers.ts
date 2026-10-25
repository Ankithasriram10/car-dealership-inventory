import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import { createApp } from '../src/app';
import { UserRepository } from '../src/repositories/userRepository';
import { hashPassword } from '../src/services/passwordHasher';

/** Builds an isolated app backed by a throw-away on-disk SQLite file. */
export function buildTestApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dealership-'));
  const { app, db } = createApp({ dbPath: path.join(dir, 'test.db'), jwtSecret: 'test-secret' });
  const cleanup = () => {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  };
  return { app, db, cleanup };
}

type App = ReturnType<typeof buildTestApp>['app'];

export async function registerAndLogin(app: App, email = 'user@example.com', password = 'Passw0rd!') {
  await request(app).post('/api/auth/register').send({ name: 'Test User', email, password });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token as string;
}

/** Admins cannot self-register, so tests insert one directly through the repository. */
export async function createAdminAndLogin(
  app: App,
  db: ReturnType<typeof buildTestApp>['db'],
  email = 'admin@example.com',
  password = 'Adm1nPass!',
) {
  new UserRepository(db).create({
    name: 'Admin',
    email,
    passwordHash: await hashPassword(password),
    role: 'admin',
  });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token as string;
}

export const sampleVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 28000,
  quantity: 5,
};
