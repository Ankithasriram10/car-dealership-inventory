import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';
import { TokenPayload } from '../types';
import { forbidden, unauthorized } from '../errors';

declare module 'express-serve-static-core' {
  interface Request { auth?: TokenPayload }
}

/** Requires a valid Bearer token and attaches its payload to req.auth. */
export const authenticate = (tokens: TokenService) => (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(unauthorized());
  try {
    req.auth = tokens.verify(header.slice(7));
    next();
  } catch (e) {
    next(e);
  }
};

/** Must run after authenticate. */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) =>
  req.auth?.role === 'admin' ? next() : next(forbidden());
