import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { parseId, VehicleService } from '../services/vehicleService';

/** All routes are mounted behind `authenticate`. */
export function vehicleRoutes(service: VehicleService): Router {
  const r = Router();

  r.post('/', (req, res, next) => {
    try { res.status(201).json(service.create(req.body)); } catch (e) { next(e); }
  });

  r.get('/', (_req, res) => { res.json(service.list()); });

  // Declared before '/:id' so "search" is not captured as an id.
  r.get('/search', (req, res, next) => {
    try { res.json(service.search(req.query)); } catch (e) { next(e); }
  });

  r.get('/:id', (req, res, next) => {
    try { res.json(service.get(parseId(req.params.id))); } catch (e) { next(e); }
  });

  r.put('/:id', (req, res, next) => {
    try { res.json(service.update(parseId(req.params.id), req.body)); } catch (e) { next(e); }
  });

  r.delete('/:id', requireAdmin, (req, res, next) => {
    try { service.remove(parseId(req.params.id)); res.status(204).end(); } catch (e) { next(e); }
  });

  return r;
}
