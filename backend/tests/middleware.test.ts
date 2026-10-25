import jwt from 'jsonwebtoken';
import request from 'supertest';
import { buildTestApp } from './helpers';
import { TokenService } from '../src/services/tokenService';

describe('Middleware & token handling', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  beforeEach(() => { ctx = buildTestApp(); });
  afterEach(() => ctx.cleanup());

  it('rejects a token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: 1, role: 'admin' }, 'attacker-secret');
    const res = await request(ctx.app).get('/api/vehicles').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ sub: 1, role: 'user' }, 'test-secret', { expiresIn: -10 });
    const res = await request(ctx.app).get('/api/vehicles').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects an Authorization header that is not a Bearer scheme', async () => {
    const res = await request(ctx.app).get('/api/vehicles').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });

  it('returns 400 for malformed JSON bodies', async () => {
    const res = await request(ctx.app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Malformed JSON body');
  });

  it('round-trips the payload through TokenService', () => {
    const svc = new TokenService('s');
    const token = svc.sign({ id: 7, name: 'x', email: 'x@y.z', role: 'admin' });
    expect(svc.verify(token)).toEqual({ sub: 7, role: 'admin' });
  });
});
