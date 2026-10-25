import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { admin, camry, customer, jsonResponse, soldOut } from './test/fixtures';

/** Routes fetch calls by "METHOD path" so each test declares only what it needs. */
function mockApi(routes: Record<string, (body?: any) => Promise<Response>>) {
  const fn = vi.fn((url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? 'GET'} ${url}`;
    const handler = routes[key];
    if (!handler) throw new Error(`Unmocked request: ${key}`);
    return handler(init.body ? JSON.parse(init.body as string) : undefined);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

async function signIn(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the login form when signed out', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows the server error on a failed login', async () => {
    mockApi({ 'POST /api/auth/login': () => jsonResponse({ error: 'Invalid email or password' }, 401) });
    render(<App />);
    await signIn('x@y.com', 'badpassword');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('logs in and lists vehicles, persisting the session', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry, soldOut]),
    });
    render(<App />);
    await signIn('casey@example.com', 'Passw0rd!');
    expect(await screen.findByText('Camry')).toBeInTheDocument();
    expect(screen.getByText('F-150')).toBeInTheDocument();
    expect(localStorage.getItem('dealership.token')).toBe('tok');
    expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument();
  });

  it('registers a new account then signs in automatically', async () => {
    mockApi({
      'POST /api/auth/register': () => jsonResponse({ user: customer }, 201),
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry]),
    });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /create an account/i }));
    await userEvent.type(screen.getByLabelText(/name/i), 'Casey Customer');
    await userEvent.type(screen.getByLabelText(/email/i), 'casey@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Camry')).toBeInTheDocument();
  });

  it('purchases a vehicle and reflects the new stock level', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'POST /api/vehicles/1/purchase': () => jsonResponse({ ...camry, quantity: 2 }),
    });
    render(<App />);
    await signIn('casey@example.com', 'Passw0rd!');
    await userEvent.click(await screen.findByRole('button', { name: /purchase/i }));
    expect(await screen.findByText(/2 in stock/i)).toBeInTheDocument();
  });

  it('surfaces a purchase failure without losing the list', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'POST /api/vehicles/1/purchase': () => jsonResponse({ error: 'Insufficient stock: 0 available' }, 409),
    });
    render(<App />);
    await signIn('casey@example.com', 'Passw0rd!');
    await userEvent.click(await screen.findByRole('button', { name: /purchase/i }));
    expect(await screen.findByText('Insufficient stock: 0 available')).toBeInTheDocument();
    expect(screen.getByText('Camry')).toBeInTheDocument();
  });

  it('runs a search through the API and renders the results', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry, soldOut]),
      'GET /api/vehicles/search?make=ford': () => jsonResponse([soldOut]),
    });
    render(<App />);
    await signIn('casey@example.com', 'Passw0rd!');
    await screen.findByText('Camry');
    await userEvent.type(screen.getByLabelText(/make/i), 'ford');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));
    await waitFor(() => expect(screen.queryByText('Camry')).not.toBeInTheDocument());
    expect(screen.getByText('F-150')).toBeInTheDocument();
  });

  it('lets an admin add a vehicle through the form', async () => {
    const created = { id: 5, make: 'Honda', model: 'Civic', category: 'Sedan', price: 24500, quantity: 7 };
    const createRoute = vi.fn(() => jsonResponse(created, 201));
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: admin }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'POST /api/vehicles': createRoute,
    });
    render(<App />);
    await signIn('admin@dealership.com', 'Admin123!');
    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/make/i), 'Honda');
    await userEvent.type(within(dialog).getByLabelText(/model/i), 'Civic');
    await userEvent.type(within(dialog).getByLabelText(/category/i), 'Sedan');
    await userEvent.type(within(dialog).getByLabelText(/price/i), '24500');
    await userEvent.type(within(dialog).getByLabelText(/quantity/i), '7');
    await userEvent.click(within(dialog).getByRole('button', { name: /add vehicle/i }));
    expect(await screen.findByText('Civic')).toBeInTheDocument();
    expect(createRoute).toHaveBeenCalledWith({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 24500, quantity: 7 });
  });

  it('asks for confirmation before an admin deletes a vehicle', async () => {
    const del = vi.fn(() => Promise.resolve({ ok: true, status: 204 } as Response));
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: admin }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'DELETE /api/vehicles/1': del,
    });
    render(<App />);
    await signIn('admin@dealership.com', 'Admin123!');
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }));
    expect(del).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(screen.queryByText('Camry')).not.toBeInTheDocument());
    expect(del).toHaveBeenCalled();
  });

  it('lets an admin restock a vehicle', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: admin }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'POST /api/vehicles/1/restock': (b) => jsonResponse({ ...camry, quantity: 3 + b.quantity }),
    });
    render(<App />);
    await signIn('admin@dealership.com', 'Admin123!');
    await userEvent.click(await screen.findByRole('button', { name: /restock/i }));
    const dialog = screen.getByRole('dialog');
    await userEvent.clear(within(dialog).getByLabelText(/units to add/i));
    await userEvent.type(within(dialog).getByLabelText(/units to add/i), '5');
    await userEvent.click(within(dialog).getByRole('button', { name: /confirm restock/i }));
    expect(await screen.findByText(/8 in stock/i)).toBeInTheDocument();
  });

  it('signs out and returns to the login form', async () => {
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: customer }),
      'GET /api/vehicles': () => jsonResponse([camry]),
    });
    render(<App />);
    await signIn('casey@example.com', 'Passw0rd!');
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }));
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem('dealership.token')).toBeNull();
  });

  it('lets an admin edit a vehicle and shows the updated price', async () => {
    const put = vi.fn((b: any) => jsonResponse({ ...camry, ...b }));
    mockApi({
      'POST /api/auth/login': () => jsonResponse({ token: 'tok', user: admin }),
      'GET /api/vehicles': () => jsonResponse([camry]),
      'PUT /api/vehicles/1': put,
    });
    render(<App />);
    await signIn('admin@dealership.com', 'Admin123!');
    await userEvent.click(await screen.findByRole('button', { name: /edit/i }));
    const dialog = screen.getByRole('dialog');
    await userEvent.clear(within(dialog).getByLabelText(/price/i));
    await userEvent.type(within(dialog).getByLabelText(/price/i), '26500');
    await userEvent.click(within(dialog).getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('$26,500')).toBeInTheDocument();
    expect(put).toHaveBeenCalledWith(expect.objectContaining({ price: 26500 }));
  });

  it('restores a saved session on reload without asking for credentials', async () => {
    localStorage.setItem('dealership.token', 'tok');
    localStorage.setItem('dealership.user', JSON.stringify(customer));
    mockApi({ 'GET /api/vehicles': () => jsonResponse([camry]) });
    render(<App />);
    expect(await screen.findByText('Camry')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('signs the user out when the API says the session has expired', async () => {
    localStorage.setItem('dealership.token', 'expired');
    localStorage.setItem('dealership.user', JSON.stringify(customer));
    mockApi({ 'GET /api/vehicles': () => jsonResponse({ error: 'Invalid or expired token' }, 401) });
    render(<App />);
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(localStorage.getItem('dealership.token')).toBeNull();
  });
});
