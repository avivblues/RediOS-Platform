import { Badge } from '../../components/atomic/atoms/Atoms';
import type { RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio_legacy_phase19/empty/EmptyState';
import { HelpTooltip } from '../../studio_legacy_phase19/help/HelpTooltip';
import { humanizeCode } from '../../studio_legacy_phase19/humanizer/HumanizerEngine';
import { PropertyEditor } from '../property/PropertyEditor';

export function PropertyPanel({
  field,
  valid,
  expertMode,
}: {
  field?: RuntimeFormField;
  valid?: boolean;
  expertMode: boolean;
}) {
  return (
    <div className="studio-card studio-edit-panel">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Panel Kanan</span>
          <h4>
            Detail Informasi
            <HelpTooltip label="Detail Informasi">Panel ini menjelaskan informasi yang dipilih dan bagaimana pengguna mengisinya.</HelpTooltip>
          </h4>
        </div>
        {valid !== undefined ? <Badge tone={valid ? 'success' : 'danger'}>{valid ? 'Pratinjau valid' : 'Perlu diperiksa'}</Badge> : null}
      </div>
      {field ? (
        <>
          <div className="studio-list-row">
            <strong>Nama tampilan</strong>
            <span>{humanizeCode(field.fieldCode)}</span>
          </div>
          {expertMode ? (
            <div className="studio-list-row">
              <strong>Technical Code</strong>
              <span>{field.fieldCode}</span>
            </div>
          ) : null}
          <div className="studio-list-row">
            <strong>Jenis input</strong>
            <span>{humanizeCode(field.component)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Wajib diisi?</strong>
            <span>{field.required ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Terlihat oleh pengguna?</strong>
            <span>{field.visible === false ? 'Disembunyikan' : 'Terlihat'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Bisa diedit?</strong>
            <span>{field.readonly ? 'Tidak' : 'Ya'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Aturan</strong>
            <span>{field.required ? 'Wajib' : 'Opsional'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Koneksi</strong>
            <span>{field.relation?.code ?? '-'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Layar daftar</strong>
            <span>{field.view?.code ?? '-'}</span>
          </div>
          <PropertyEditor node={field as unknown as Record<string, unknown>} onChange={() => undefined} />
        </>
      ) : (
        <EmptyState
          title="Belum ada informasi dipilih"
          description="Klik informasi di area tengah untuk melihat nama tampilan, jenis input, aturan, dan koneksinya."
        />
      )}
    </div>
  );
}
