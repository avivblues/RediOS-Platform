interface MetadataConfirmDeleteModalProps {
  title: string;
  target: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MetadataConfirmDeleteModal({
  title,
  target,
  description = 'Metadata ini akan dihapus dari draft aplikasi. Aksi ini tidak dijalankan sampai Anda klik Confirm Delete.',
  onCancel,
  onConfirm,
}: MetadataConfirmDeleteModalProps) {
  return (
    <div className="redos-confirm-backdrop" role="presentation">
      <section className="redos-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="redos-confirm-title">
        <div>
          <span className="redos-kicker">Confirm Delete</span>
          <h3 id="redos-confirm-title">{title}</h3>
          <p><strong>{target}</strong> - {description}</p>
        </div>
        <div className="redos-confirm-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button className="redos-danger-action" type="button" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </section>
    </div>
  );
}
