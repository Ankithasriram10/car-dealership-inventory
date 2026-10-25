import { ReactNode, useEffect } from 'react';

interface Props {
  title: string;
  role?: 'dialog' | 'alertdialog';
  onClose: () => void;
  children: ReactNode;
}

/** Accessible overlay: closes on Escape or backdrop click. */
export function Modal({ title, role = 'dialog', onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role={role} aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl bg-paper-card p-6 shadow-2xl">
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">{title}</h2>
        {children}
      </div>
    </div>
  );
}
