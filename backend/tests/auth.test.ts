import request from 'supertest';
import { buildTestApp } from './helpers';

describe('Auth API', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  beforeEach(() => { ctx = buildTestApp(); });
  afterEach(() => ctx.cleanup());

  describe('POST /api/auth/register', () => {
    const valid = { name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' };

    it('creates a user and never returns the password hash', async () => {
      const res = await request(ctx.app).post('/api/auth/register').send(valid);
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ name: 'Ada', email: 'ada@example.com', role: 'user' });
      expect(res.body.user.id).toBeDefined();
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
    });

    it('ignores a client-supplied role so users cannot self-promote to admin', async () => {
      const res = await request(ctx.app).post('/api/auth/register').send({ ...valid, role: 'admin' });
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('user');
    });

    it('rejects a duplicate email (case-insensitive) with 409', async () => {
      await request(ctx.app).post('/api/auth/register').send(valid);
      const res = await request(ctx.app).post('/api/auth/register').send({ ...valid, email: 'ADA@example.com' });
      expect(res.status).toBe(409);
    });

    it.each([
      ['invalid email', { ...valid, email: 'nope' }],
      ['short password', { ...valid, password: '123' }],
      ['missing name', { email: valid.email, password: valid.password }],
    ])('returns 400 for %s', async (_label, body) => {
      const res = await request(ctx.app).post('/api/auth/register').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    const creds = { email: 'ada@example.com', password: 'Passw0rd!' };
    beforeEach(async () => {
      await request(ctx.app).post('/api/auth/register').send({ name: 'Ada', ...creds });
    });

    it('returns a JWT and the user on valid credentials', async () => {
      const res = await request(ctx.app).post('/api/auth/login').send(creds);
      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user.email).toBe(creds.email);
    });

    it('returns 401 for a wrong password', async () => {
      const res = await request(ctx.app).post('/api/auth/login').send({ ...creds, password: 'wrong-pass' });
      expect(res.status).toBe(401);
    });

    it('returns 401 for an unknown user without revealing which part was wrong', async () => {
      const res = await request(ctx.app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever1' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });

  describe('token protection', () => {
    it('rejects requests without a token', async () => {
      const res = await request(ctx.app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });

    it('rejects a malformed token', async () => {
      const res = await request(ctx.app).get('/api/vehicles').set('Authorization', 'Bearer not.a.token');
      expect(res.status).toBe(401);
    });
  });
});
