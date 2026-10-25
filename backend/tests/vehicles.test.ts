import request from 'supertest';
import { buildTestApp, createAdminAndLogin, registerAndLogin, sampleVehicle } from './helpers';

describe('Vehicles API', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    ctx = buildTestApp();
    userToken = await registerAndLogin(ctx.app);
    adminToken = await createAdminAndLogin(ctx.app, ctx.db);
  });
  afterEach(() => ctx.cleanup());

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const add = (body: object = sampleVehicle, token = adminToken) =>
    request(ctx.app).post('/api/vehicles').set(auth(token)).send(body);

  describe('POST /api/vehicles', () => {
    it('adds a vehicle with a generated unique id', async () => {
      const a = await add();
      const b = await add({ ...sampleVehicle, model: 'Corolla' });
      expect(a.status).toBe(201);
      expect(a.body).toMatchObject(sampleVehicle);
      expect(a.body.id).not.toBe(b.body.id);
    });

    it('defaults quantity to 0 when omitted', async () => {
      const { quantity: _q, ...noQty } = sampleVehicle;
      const res = await add(noQty);
      expect(res.status).toBe(201);
      expect(res.body.quantity).toBe(0);
    });

    it.each([
      ['missing make', { ...sampleVehicle, make: '' }],
      ['negative price', { ...sampleVehicle, price: -1 }],
      ['non-numeric price', { ...sampleVehicle, price: 'cheap' }],
      ['fractional quantity', { ...sampleVehicle, quantity: 1.5 }],
      ['negative quantity', { ...sampleVehicle, quantity: -3 }],
    ])('rejects %s with 400', async (_l, body) => {
      const res = await add(body);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('lists all vehicles, including out-of-stock ones', async () => {
      await add();
      await add({ ...sampleVehicle, model: 'Sold Out', quantity: 0 });
      const res = await request(ctx.app).get('/api/vehicles').set(auth(userToken));
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('returns an empty array when there is no stock', async () => {
      const res = await request(ctx.app).get('/api/vehicles').set(auth(userToken));
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('returns one vehicle', async () => {
      const { body } = await add();
      const res = await request(ctx.app).get(`/api/vehicles/${body.id}`).set(auth(userToken));
      expect(res.status).toBe(200);
      expect(res.body.model).toBe('Camry');
    });
    it('404s for an unknown id', async () => {
      const res = await request(ctx.app).get('/api/vehicles/999').set(auth(userToken));
      expect(res.status).toBe(404);
    });
    it('400s for a non-numeric id', async () => {
      const res = await request(ctx.app).get('/api/vehicles/abc').set(auth(userToken));
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await add({ make: 'Toyota', model: 'Camry', category: 'Sedan', price: 28000, quantity: 3 });
      await add({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 35000, quantity: 2 });
      await add({ make: 'Ford', model: 'Mustang', category: 'Coupe', price: 45000, quantity: 1 });
      await add({ make: 'Ford', model: 'F-150', category: 'Truck', price: 52000, quantity: 0 });
    });
    const search = (qs: string) => request(ctx.app).get(`/api/vehicles/search?${qs}`).set(auth(userToken));
    const models = (res: request.Response) => res.body.map((v: any) => v.model).sort();

    it('filters by make (case-insensitive)', async () => {
      expect(models(await search('make=toyota'))).toEqual(['Camry', 'RAV4']);
    });
    it('matches model by partial text', async () => {
      expect(models(await search('model=mus'))).toEqual(['Mustang']);
    });
    it('filters by category', async () => {
      expect(models(await search('category=suv'))).toEqual(['RAV4']);
    });
    it('filters by price range (inclusive)', async () => {
      expect(models(await search('minPrice=35000&maxPrice=45000'))).toEqual(['Mustang', 'RAV4']);
    });
    it('supports open-ended price bounds', async () => {
      expect(models(await search('minPrice=50000'))).toEqual(['F-150']);
      expect(models(await search('maxPrice=28000'))).toEqual(['Camry']);
    });
    it('combines filters with AND semantics', async () => {
      expect(models(await search('make=ford&maxPrice=46000'))).toEqual(['Mustang']);
    });
    it('returns all vehicles when no filters are provided', async () => {
      expect((await search('')).body).toHaveLength(4);
    });
    it('treats SQL wildcards in input literally', async () => {
      expect((await search('make=%25')).body).toHaveLength(0);
    });
    it('rejects a non-numeric price with 400', async () => {
      expect((await search('minPrice=abc')).status).toBe(400);
    });
    it('rejects minPrice greater than maxPrice with 400', async () => {
      expect((await search('minPrice=100&maxPrice=50')).status).toBe(400);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('updates only the supplied fields', async () => {
      const { body } = await add();
      const res = await request(ctx.app).put(`/api/vehicles/${body.id}`).set(auth(adminToken)).send({ price: 26500 });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ ...sampleVehicle, price: 26500, id: body.id });
    });
    it('404s for an unknown vehicle', async () => {
      const res = await request(ctx.app).put('/api/vehicles/999').set(auth(adminToken)).send({ price: 1 });
      expect(res.status).toBe(404);
    });
    it('400s on invalid values', async () => {
      const { body } = await add();
      const res = await request(ctx.app).put(`/api/vehicles/${body.id}`).set(auth(adminToken)).send({ price: -5 });
      expect(res.status).toBe(400);
    });
    it('400s on an empty update body', async () => {
      const { body } = await add();
      const res = await request(ctx.app).put(`/api/vehicles/${body.id}`).set(auth(adminToken)).send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('forbids non-admin users', async () => {
      const { body } = await add();
      const res = await request(ctx.app).delete(`/api/vehicles/${body.id}`).set(auth(userToken));
      expect(res.status).toBe(403);
    });
    it('lets an admin delete, after which the vehicle is gone', async () => {
      const { body } = await add();
      const del = await request(ctx.app).delete(`/api/vehicles/${body.id}`).set(auth(adminToken));
      expect(del.status).toBe(204);
      const get = await request(ctx.app).get(`/api/vehicles/${body.id}`).set(auth(adminToken));
      expect(get.status).toBe(404);
    });
    it('404s for an unknown vehicle', async () => {
      const res = await request(ctx.app).delete('/api/vehicles/999').set(auth(adminToken));
      expect(res.status).toBe(404);
    });
  });
});
