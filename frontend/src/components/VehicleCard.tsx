import type { Vehicle } from '../types';
import { formatPrice } from '../format';
import { CarArt } from './CarArt';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy?: boolean;
  onPurchase: (v: Vehicle) => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
  onRestock: (v: Vehicle) => void;
}

const secondary = 'rounded-lg border border-paper-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-pine';

export function VehicleCard({ vehicle, isAdmin, busy, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const soldOut = vehicle.quantity === 0;
  const low = vehicle.quantity > 0 && vehicle.quantity <= 2;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-paper-line bg-paper-card shadow-card transition hover:-translate-y-0.5">
      <div className="relative h-40 overflow-hidden">
        <CarArt vehicle={vehicle} />
        <span className="absolute left-3 top-3 rounded-full bg-paper-card/90 px-2.5 py-1 text-xs font-semibold text-ink-soft backdrop-blur">
          {vehicle.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-mute">{vehicle.make}</p>
          <h3 className="font-display text-2xl font-semibold leading-tight text-ink">{vehicle.model}</h3>
        </div>

        <div className="flex items-end justify-between">
          <p className="font-display text-2xl text-pine">{formatPrice(vehicle.price)}</p>
          {soldOut ? (
            <span className="rounded-full bg-ember-light px-2.5 py-1 text-xs font-semibold text-ember">Out of stock</span>
          ) : (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${low ? 'bg-ember-light text-ember' : 'bg-pine-light text-pine-dark'}`}>
              {vehicle.quantity} in stock
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={soldOut || busy}
          onClick={() => onPurchase(vehicle)}
          className="rounded-xl bg-pine px-4 py-2.5 font-semibold text-white transition hover:bg-pine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:bg-paper-line disabled:text-ink-mute"
        >
          Purchase
        </button>

        {isAdmin && (
          <div className="flex flex-wrap gap-2 border-t border-dashed border-paper-line pt-4">
            <button type="button" className={secondary} onClick={() => onEdit(vehicle)}>Edit</button>
            <button type="button" className={secondary} onClick={() => onRestock(vehicle)}>Restock</button>
            <button type="button" className={`${secondary} ml-auto hover:!border-ember hover:!text-ember`} onClick={() => onDelete(vehicle)}>Delete</button>
          </div>
        )}
      </div>
    </article>
  );
}
