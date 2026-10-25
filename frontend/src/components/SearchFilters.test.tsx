import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters } from './SearchFilters';

describe('SearchFilters', () => {
  it('submits the entered filters', async () => {
    const onSearch = vi.fn();
    render(<SearchFilters onSearch={onSearch} categories={['Sedan', 'SUV']} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Toyota');
    await userEvent.type(screen.getByLabelText(/model/i), 'Cam');
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Sedan');
    await userEvent.type(screen.getByLabelText(/min price/i), '10000');
    await userEvent.type(screen.getByLabelText(/max price/i), '30000');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith({
      make: 'Toyota', model: 'Cam', category: 'Sedan', minPrice: '10000', maxPrice: '30000',
    });
  });

  it('resets every field and re-runs an empty search', async () => {
    const onSearch = vi.fn();
    render(<SearchFilters onSearch={onSearch} categories={['Sedan']} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'Ford');
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/make/i)).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith({ make: '', model: '', category: '', minPrice: '', maxPrice: '' });
  });

  it('blocks a search where min price exceeds max price', async () => {
    const onSearch = vi.fn();
    render(<SearchFilters onSearch={onSearch} categories={[]} />);
    await userEvent.type(screen.getByLabelText(/min price/i), '500');
    await userEvent.type(screen.getByLabelText(/max price/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/min price/i);
  });
});
