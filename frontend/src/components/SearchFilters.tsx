import { FormEvent, useId, useState } from 'react';
import { EMPTY_FILTERS, SearchFilterValues } from '../types';
import { Field, inputClass } from './fields';

interface Props {
  categories: string[];
  onSearch: (filters: SearchFilterValues) => void;
}

export function SearchFilters({ categories, onSearch }: Props) {
  const categoryId = useId();
  const [values, setValues] = useState<SearchFilterValues>(EMPTY_FILTERS);
  const [error, setError] = useState('');
  const set = (k: keyof SearchFilterValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const { minPrice, maxPrice } = values;
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError('Min price cannot be greater than max price.');
      return;
    }
    setError('');
    onSearch(values);
  }

  function reset() {
    setValues(EMPTY_FILTERS);
    setError('');
    onSearch(EMPTY_FILTERS);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-paper-line bg-paper-card p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Make" value={values.make} onChange={set('make')} placeholder="Toyota" />
        <Field label="Model" value={values.model} onChange={set('model')} placeholder="Camry" />
        <div>
          <label htmlFor={categoryId} className="mb-1 block text-sm font-medium text-ink-soft">Category</label>
          <select id={categoryId} className={inputClass} value={values.category} onChange={set('category')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Min price" type="number" min={0} value={values.minPrice} onChange={set('minPrice')} placeholder="0" />
        <Field label="Max price" type="number" min={0} value={values.maxPrice} onChange={set('maxPrice')} placeholder="60000" />
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-ember">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className="rounded-xl bg-ink px-5 py-2 font-semibold text-paper transition hover:bg-pine-dark">Search</button>
        <button type="button" onClick={reset} className="rounded-xl border border-paper-line px-5 py-2 font-medium text-ink-soft transition hover:border-ink">Reset</button>
      </div>
    </form>
  );
}
