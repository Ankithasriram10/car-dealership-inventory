import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleFormModal } from './VehicleFormModal';
import { camry } from '../test/fixtures';

describe('VehicleFormModal', () => {
  it('submits a new vehicle with numeric price and quantity', async () => {
    const onSubmit = vi.fn();
    render(<VehicleFormModal onSubmit={onSubmit} onClose={() => {}} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Honda');
    await userEvent.type(screen.getByLabelText(/model/i), 'Civic');
    await userEvent.type(screen.getByLabelText(/category/i), 'Sedan');
    await userEvent.type(screen.getByLabelText(/price/i), '24500');
    await userEvent.type(screen.getByLabelText(/quantity/i), '7');
    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(onSubmit).toHaveBeenCalledWith({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 24500, quantity: 7 });
  });

  it('pre-fills the form when editing', () => {
    render(<VehicleFormModal vehicle={camry} onSubmit={() => {}} onClose={() => {}} />);
    expect(screen.getByLabelText(/make/i)).toHaveValue('Toyota');
    expect(screen.getByLabelText(/price/i)).toHaveValue(28000);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation errors and does not submit invalid data', async () => {
    const onSubmit = vi.fn();
    render(<VehicleFormModal onSubmit={onSubmit} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('displays a server error passed in by the parent', () => {
    render(<VehicleFormModal onSubmit={() => {}} onClose={() => {}} error="Price cannot be negative" />);
    expect(screen.getByText('Price cannot be negative')).toBeInTheDocument();
  });

  it('closes on Cancel', async () => {
    const onClose = vi.fn();
    render(<VehicleFormModal onSubmit={() => {}} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
