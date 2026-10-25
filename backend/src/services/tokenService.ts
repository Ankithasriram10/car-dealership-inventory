import jwt from 'jsonwebtoken';
import { TokenPayload, User } from '../types';
import { unauthorized } from '../errors';

/** Issues and verifies JWTs. The secret is injected so tests and prod can differ. */
export class TokenService {
  constructor(private readonly secret: string, private readonly expiresIn: string = '8h') {}

  sign(user: User): string {
    const payload: TokenPayload = { sub: user.id, role: user.role };
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as unknown as TokenPayload;
      return { sub: Number(decoded.sub), role: decoded.role };
    } catch {
      throw unauthorized('Invalid or expired token');
    }
  }
}
