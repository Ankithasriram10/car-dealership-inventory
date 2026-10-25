import { InputHTMLAttributes, useId } from 'react';

export const inputClass =
  'w-full rounded-lg border border-paper-line bg-white px-3 py-2 text-ink placeholder:text-ink-mute/60 focus:border-pine focus:outline-2 focus:outline-pine/30';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Label + input + inline error, wired together for accessibility. */
export function Field({ label, error, id, ...rest }: FieldProps) {
  const generatedId = useId(); // unique per instance, so the search bar and a modal can both have a "Make" field
  const fieldId = id ?? generatedId;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-ink-soft">{label}</label>
      <input id={fieldId} aria-invalid={!!error} className={inputClass} {...rest} />
      {error && <p role="alert" className="mt-1 text-sm text-ember">{error}</p>}
    </div>
  );
}
