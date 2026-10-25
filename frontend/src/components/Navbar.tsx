import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-paper-line bg-paper-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine font-display text-lg font-bold text-white">N</span>
          <span className="font-display text-xl font-semibold text-ink">Northline Motors</span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs uppercase tracking-widest text-ink-mute">{user.role}</p>
            </div>
            <button type="button" onClick={logout} className="rounded-lg border border-paper-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
