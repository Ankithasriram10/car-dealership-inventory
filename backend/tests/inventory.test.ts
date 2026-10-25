import request from 'supertest';
import { buildTestApp, createAdminAndLogin, registerAndLogin, sampleVehicle } from './helpers';

describe('Inventory API', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const purchase = (id: number, body: object = {}, token = userToken) =>
    request(ctx.app).post(`/api/vehicles/${id}/purchase`).set(auth(token)).send(body);
  const restock = (id: number, body: object, token = adminToken) =>
    request(ctx.app).post(`/api/vehicles/${id}/restock`).set(auth(token)).send(body);

  beforeEach(async () => {
    ctx = buildTestApp();
    userToken = await registerAndLogin(ctx.app);
    adminToken = await createAdminAndLogin(ctx.app, ctx.db);
    const res = await request(ctx.app).post('/api/vehicles').set(auth(adminToken)).send({ ...sampleVehicle, quantity: 2 });
    vehicleId = res.body.id;
  });
  afterEach(() => ctx.cleanup());

  describe('POST /api/vehicles/:id/purchase', () => {
    it('decreases quantity by 1 by default and returns the updated vehicle', async () => {
      const res = await purchase(vehicleId);
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1);
    });

    it('supports purchasing several units at once', async () => {
      const res = await purchase(vehicleId, { quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(0);
    });

    it('returns 409 and leaves stock untouched when stock is insufficient', async () => {
      const res = await purchase(vehicleId, { quantity: 3 });
      expect(res.status).toBe(409);
      const after = await request(ctx.app).get(`/api/vehicles/${vehicleId}`).set(auth(userToken));
      expect(after.body.quantity).toBe(2);
    });

    it('returns 409 for an out-of-stock vehicle', async () => {
      await purchase(vehicleId, { quantity: 2 });
      expect((await purchase(vehicleId)).status).toBe(409);
    });

    it('never oversells under concurrent purchases', async () => {
      const results = await Promise.all(Array.from({ length: 6 }, () => purchase(vehicleId)));
      expect(results.filter((r) => r.status === 200)).toHaveLength(2);
      expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    });

    it('returns 404 for an unknown vehicle', async () => {
      expect((await purchase(999)).status).toBe(404);
    });

    it.each([[0], [-1], [1.5], ['two']])('rejects quantity %p with 400', async (q) => {
      expect((await purchase(vehicleId, { quantity: q })).status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(ctx.app).post(`/api/vehicles/${vehicleId}/purchase`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('lets an admin increase quantity', async () => {
      const res = await restock(vehicleId, { quantity: 10 });
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(12);
    });

    it('forbids non-admin users', async () => {
      expect((await restock(vehicleId, { quantity: 10 }, userToken)).status).toBe(403);
    });

    it.each([[0], [-5], [2.2], [undefined]])('rejects quantity %p with 400', async (q) => {
      expect((await restock(vehicleId, { quantity: q })).status).toBe(400);
    });

    it('returns 404 for an unknown vehicle', async () => {
      expect((await restock(999, { quantity: 1 })).status).toBe(404);
    });

    it('makes an out-of-stock vehicle purchasable again', async () => {
      await purchase(vehicleId, { quantity: 2 });
      await restock(vehicleId, { quantity: 1 });
      expect((await purchase(vehicleId)).status).toBe(200);
    });
  });
});
