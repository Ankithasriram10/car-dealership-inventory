import { FormEvent, useState } from 'react';
import type { Vehicle, VehicleInput } from '../types';
import { Field } from './fields';
import { Modal } from './Modal';

interface Props {
  vehicle?: Vehicle;
  categories?: string[];
  error?: string;
  onSubmit: (input: VehicleInput) => void;
  onClose: () => void;
}

type Errors = Partial<Record<keyof VehicleInput, string>>;

/** Validates raw form strings; the server re-validates, this just gives fast feedback. */
function validate(f: Record<keyof VehicleInput, string>): Errors {
  const e: Errors = {};
  if (!f.make.trim()) e.make = 'Make is required';
  if (!f.model.trim()) e.model = 'Model is required';
  if (!f.category.trim()) e.category = 'Category is required';
  if (f.price === '' || Number(f.price) < 0) e.price = 'Enter a price of 0 or more';
  if (f.quantity === '' || !Number.isInteger(Number(f.quantity)) || Number(f.quantity) < 0) e.quantity = 'Enter a whole number of 0 or more';
  return e;
}

/** Create/edit form. Editing pre-fills values; the parent owns the API call. */
export function VehicleFormModal({ vehicle, categories = [], error, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? '',
    price: vehicle ? String(vehicle.price) : '',
    quantity: vehicle ? String(vehicle.quantity) : '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
  }

  return (
    <Modal title={vehicle ? 'Edit vehicle' : 'Add a vehicle'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Make" value={form.make} onChange={set('make')} error={errors.make} />
          <Field label="Model" value={form.model} onChange={set('model')} error={errors.model} />
        </div>
        <Field label="Category" list="category-options" value={form.category} onChange={set('category')} error={errors.category} />
        <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" type="number" min={0} step="any" value={form.price} onChange={set('price')} error={errors.price} />
          <Field label="Quantity" type="number" min={0} value={form.quantity} onChange={set('quantity')} error={errors.quantity} />
        </div>
        {error && <p role="alert" className="rounded-lg bg-ember-light px-3 py-2 text-sm text-ember">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-paper-line px-5 py-2 font-medium text-ink-soft hover:border-ink">Cancel</button>
          <button type="submit" className="rounded-xl bg-pine px-5 py-2 font-semibold text-white hover:bg-pine-dark">
            {vehicle ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
