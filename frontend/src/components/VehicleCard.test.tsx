import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from './VehicleCard';
import { camry, soldOut } from '../test/fixtures';

const noop = () => {};
const props = { isAdmin: false, onPurchase: noop, onEdit: noop, onDelete: noop, onRestock: noop };

describe('VehicleCard', () => {
  it('shows make, model, category, formatted price and stock', () => {
    render(<VehicleCard vehicle={camry} {...props} />);
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Camry')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('$28,000')).toBeInTheDocument();
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument();
  });

  it('calls onPurchase when Purchase is clicked', async () => {
    const onPurchase = vi.fn();
    render(<VehicleCard vehicle={camry} {...props} onPurchase={onPurchase} />);
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith(camry);
  });

  it('disables Purchase and flags the vehicle when quantity is zero', () => {
    render(<VehicleCard vehicle={soldOut} {...props} />);
    expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled();
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  it('hides admin controls from regular users', () => {
    render(<VehicleCard vehicle={camry} {...props} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restock/i })).not.toBeInTheDocument();
  });

  it('shows and wires admin controls for admins', async () => {
    const onEdit = vi.fn(), onDelete = vi.fn(), onRestock = vi.fn();
    render(<VehicleCard vehicle={camry} {...props} isAdmin onEdit={onEdit} onDelete={onDelete} onRestock={onRestock} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByRole('button', { name: /restock/i }));
    expect(onEdit).toHaveBeenCalledWith(camry);
    expect(onDelete).toHaveBeenCalledWith(camry);
    expect(onRestock).toHaveBeenCalledWith(camry);
  });
});
