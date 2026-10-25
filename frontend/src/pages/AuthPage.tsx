import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/fields';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-pine p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-pine-dark/60" />
        <div className="absolute -left-10 top-40 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative font-display text-5xl font-semibold leading-tight">Every car on the lot,<br />one honest ledger.</p>
        <p className="relative mt-4 max-w-md text-pine-light">Browse live inventory, buy in a click, and keep stock accurate — no spreadsheets, no oversold cars.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-4xl font-semibold text-ink">{isLogin ? 'Sign in' : 'Create your account'}</h1>
            <p className="mt-1 text-ink-mute">{isLogin ? 'Welcome back to Northline.' : 'It takes less than a minute.'}</p>
          </div>
          {!isLogin && <Field label="Name" autoComplete="name" value={form.name} onChange={set('name')} required />}
          <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
          <Field label="Password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} required minLength={isLogin ? undefined : 8} />
          {error && <p role="alert" className="rounded-lg bg-ember-light px-3 py-2 text-sm text-ember">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-pine px-4 py-3 font-semibold text-white transition hover:bg-pine-dark disabled:opacity-60">
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
          <p className="text-center text-sm text-ink-mute">
            {isLogin ? 'New here? ' : 'Already registered? '}
            <button type="button" onClick={switchMode} className="font-semibold text-pine underline-offset-2 hover:underline">
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
