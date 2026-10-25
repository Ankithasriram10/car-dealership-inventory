import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RestockModal } from '../components/RestockModal';
import { SearchFilters } from '../components/SearchFilters';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { formatPrice } from '../format';
import { EMPTY_FILTERS, SearchFilterValues, Vehicle, VehicleInput } from '../types';

type Dialog =
  | { kind: 'add' }
  | { kind: 'edit'; vehicle: Vehicle }
  | { kind: 'restock'; vehicle: Vehicle }
  | { kind: 'delete'; vehicle: Vehicle }
  | null;

interface Toast { kind: 'success' | 'error'; text: string }

const isEmpty = (f: SearchFilterValues) => Object.values(f).every((v) => !v.trim());
const byId = (a: Vehicle, b: Vehicle) => a.id - b.id;

export function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [dialogError, setDialogError] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);

  /** Centralised failure handling: an expired session sends the user back to sign-in. */
  const fail = useCallback((err: unknown): string => {
    if (err instanceof ApiError && err.status === 401) logout();
    return err instanceof Error ? err.message : 'Something went wrong';
  }, [logout]);

  const remember = useCallback((list: Vehicle[]) => {
    setCategories((prev) => [...new Set([...prev, ...list.map((v) => v.category)])].sort());
  }, []);

  const load = useCallback(async (filters: SearchFilterValues = EMPTY_FILTERS) => {
    setLoading(true);
    setLoadError('');
    try {
      const list = isEmpty(filters) ? await api.listVehicles() : await api.searchVehicles(filters);
      setVehicles(list);
      remember(list);
    } catch (err) {
      setLoadError(fail(err));
    } finally {
      setLoading(false);
    }
  }, [fail, remember]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const replace = (v: Vehicle) => setVehicles((list) => list.map((x) => (x.id === v.id ? v : x)));
  const closeDialog = () => { setDialog(null); setDialogError(''); };

  async function purchase(v: Vehicle) {
    setBusyId(v.id);
    try {
      replace(await api.purchaseVehicle(v.id));
      setToast({ kind: 'success', text: `Purchased ${v.make} ${v.model}.` });
    } catch (err) {
      setToast({ kind: 'error', text: fail(err) });
      void load(); // stock may have changed under us; show the truth
    } finally {
      setBusyId(null);
    }
  }

  /** Runs a dialog action; on failure the message stays in the dialog so input is not lost. */
  async function runDialog(action: () => Promise<void>) {
    setDialogError('');
    try {
      await action();
      closeDialog();
    } catch (err) {
      setDialogError(fail(err));
    }
  }

  const add = (input: VehicleInput) => runDialog(async () => {
    const created = await api.createVehicle(input);
    setVehicles((l) => [...l, created].sort(byId));
    remember([created]);
    setToast({ kind: 'success', text: `Added ${created.make} ${created.model}.` });
  });

  const edit = (v: Vehicle, input: VehicleInput) => runDialog(async () => {
    const updated = await api.updateVehicle(v.id, input);
    replace(updated);
    remember([updated]);
    setToast({ kind: 'success', text: `Updated ${updated.make} ${updated.model}.` });
  });

  const restock = (v: Vehicle, qty: number) => runDialog(async () => {
    replace(await api.restockVehicle(v.id, qty));
    setToast({ kind: 'success', text: `Restocked ${qty} × ${v.make} ${v.model}.` });
  });

  const remove = (v: Vehicle) => runDialog(async () => {
    await api.deleteVehicle(v.id);
    setVehicles((l) => l.filter((x) => x.id !== v.id));
    setToast({ kind: 'success', text: `Deleted ${v.make} ${v.model}.` });
  });

  const stats = useMemo(() => ({
    models: vehicles.length,
    units: vehicles.reduce((s, v) => s + v.quantity, 0),
    value: vehicles.reduce((s, v) => s + v.price * v.quantity, 0),
  }), [vehicles]);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-pine">Showroom</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Find your next car</h1>
        </div>
        <dl className="flex gap-8">
          {[['Models', stats.models], ['Units on lot', stats.units], ...(isAdmin ? [['Stock value', formatPrice(stats.value)]] : [])].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-widest text-ink-mute">{k}</dt>
              <dd className="font-display text-2xl text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SearchFilters categories={categories} onSearch={load} />

      {isAdmin && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setDialog({ kind: 'add' })} className="rounded-xl bg-ember px-5 py-2.5 font-semibold text-white shadow-card hover:opacity-90">
            + Add vehicle
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-ink-mute" aria-busy="true">Loading inventory…</p>
      ) : loadError ? (
        <div className="rounded-2xl border border-ember/30 bg-ember-light p-8 text-center">
          <p className="mb-4 text-ember">{loadError}</p>
          <button type="button" onClick={() => void load()} className="rounded-lg bg-ember px-4 py-2 font-semibold text-white">Try again</button>
        </div>
      ) : vehicles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-paper-line py-16 text-center text-ink-mute">No vehicles match your search.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isAdmin={isAdmin}
              busy={busyId === v.id}
              onPurchase={purchase}
              onEdit={(x) => setDialog({ kind: 'edit', vehicle: x })}
              onRestock={(x) => setDialog({ kind: 'restock', vehicle: x })}
              onDelete={(x) => setDialog({ kind: 'delete', vehicle: x })}
            />
          ))}
        </div>
      )}

      {dialog?.kind === 'add' && <VehicleFormModal categories={categories} error={dialogError} onSubmit={add} onClose={closeDialog} />}
      {dialog?.kind === 'edit' && <VehicleFormModal vehicle={dialog.vehicle} categories={categories} error={dialogError} onSubmit={(i) => edit(dialog.vehicle, i)} onClose={closeDialog} />}
      {dialog?.kind === 'restock' && <RestockModal vehicle={dialog.vehicle} error={dialogError} onSubmit={(q) => restock(dialog.vehicle, q)} onClose={closeDialog} />}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete vehicle?"
          message={`${dialog.vehicle.make} ${dialog.vehicle.model} will be permanently removed from inventory.${dialogError ? ` ${dialogError}` : ''}`}
          confirmLabel="Delete"
          onConfirm={() => remove(dialog.vehicle)}
          onCancel={closeDialog}
        />
      )}

      {toast && (
        <div role={toast.kind === 'error' ? 'alert' : 'status'} className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl ${toast.kind === 'error' ? 'bg-ember' : 'bg-ink'}`}>
          {toast.text}
        </div>
      )}
    </main>
  );
}
