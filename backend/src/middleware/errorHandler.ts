import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  // Malformed JSON bodies surface from express.json() with a status field.
  if ((err as any)?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
