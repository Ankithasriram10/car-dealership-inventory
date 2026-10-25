import { Router } from 'express';
import { AuthService } from '../services/authService';

export function authRoutes(auth: AuthService): Router {
  const r = Router();
  r.post('/register', async (req, res, next) => {
    try { res.status(201).json({ user: await auth.register(req.body) }); } catch (e) { next(e); }
  });
  r.post('/login', async (req, res, next) => {
    try { res.json(await auth.login(req.body)); } catch (e) { next(e); }
  });
  return r;
}
