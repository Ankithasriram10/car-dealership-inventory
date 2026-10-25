import { Modal } from './Modal';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Destructive-action confirmation (rendered as an alertdialog for screen readers). */
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal title={title} role="alertdialog" onClose={onCancel}>
      <p className="mb-6 text-ink-soft">{message}</p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-paper-line px-5 py-2 font-medium text-ink-soft hover:border-ink">Cancel</button>
        <button type="button" onClick={onConfirm} className="rounded-xl bg-ember px-5 py-2 font-semibold text-white hover:opacity-90">{confirmLabel}</button>
      </div>
    </Modal>
  );
}
