import { api, ApiError } from './client';
import { jsonResponse } from '../test/fixtures';

describe('api client', () => {
  const fetchMock = vi.fn();
  beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the stored token as a Bearer header', async () => {
    localStorage.setItem('dealership.token', 'abc123');
    fetchMock.mockReturnValue(jsonResponse([]));
    await api.listVehicles();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/vehicles');
    expect(init.headers.Authorization).toBe('Bearer abc123');
  });

  it('omits empty filters from the search query string', async () => {
    fetchMock.mockReturnValue(jsonResponse([]));
    await api.searchVehicles({ make: 'ford', model: '', category: 'Truck', minPrice: '', maxPrice: '50000' });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/search?make=ford&category=Truck&maxPrice=50000');
  });

  it('throws ApiError carrying the server message and status', async () => {
    fetchMock.mockReturnValue(jsonResponse({ error: 'Insufficient stock: 0 available' }, 409));
    await expect(api.purchaseVehicle(1)).rejects.toMatchObject({
      name: 'ApiError', message: 'Insufficient stock: 0 available', status: 409,
    });
    await expect(api.purchaseVehicle(1)).rejects.toBeInstanceOf(ApiError);
  });

  it('handles 204 responses without a body', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ ok: true, status: 204 } as Response));
    await expect(api.deleteVehicle(1)).resolves.toBeUndefined();
  });

  it('posts restock quantity as JSON', async () => {
    fetchMock.mockReturnValue(jsonResponse({}));
    await api.restockVehicle(4, 10);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/vehicles/4/restock');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ quantity: 10 });
  });
});
