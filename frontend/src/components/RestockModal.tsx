import { FormEvent, useState } from 'react';
import type { Vehicle } from '../types';
import { Field } from './fields';
import { Modal } from './Modal';

interface Props {
  vehicle: Vehicle;
  error?: string;
  onSubmit: (quantity: number) => void;
  onClose: () => void;
}

export function RestockModal({ vehicle, error, onSubmit, onClose }: Props) {
  const [units, setUnits] = useState('1');
  const [fieldError, setFieldError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(units);
    if (!Number.isInteger(n) || n < 1) return setFieldError('Enter a whole number of at least 1');
    onSubmit(n);
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-ink-mute">Currently {vehicle.quantity} in stock.</p>
        <Field label="Units to add" type="number" min={1} value={units} onChange={(e) => setUnits(e.target.value)} error={fieldError} />
        {error && <p role="alert" className="rounded-lg bg-ember-light px-3 py-2 text-sm text-ember">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-paper-line px-5 py-2 font-medium text-ink-soft hover:border-ink">Cancel</button>
          <button type="submit" className="rounded-xl bg-pine px-5 py-2 font-semibold text-white hover:bg-pine-dark">Confirm restock</button>
        </div>
      </form>
    </Modal>
  );
}
