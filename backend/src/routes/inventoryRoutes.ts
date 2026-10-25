import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';
import { parseId } from '../services/vehicleService';

/** Mounted under /api/vehicles behind `authenticate`. */
export function inventoryRoutes(service: InventoryService): Router {
  const r = Router();

  r.post('/:id/purchase', (req, res, next) => {
    try { res.json(service.purchase(parseId(req.params.id), req.body)); } catch (e) { next(e); }
  });

  r.post('/:id/restock', requireAdmin, (req, res, next) => {
    try { res.json(service.restock(parseId(req.params.id), req.body)); } catch (e) { next(e); }
  });

  return r;
}
