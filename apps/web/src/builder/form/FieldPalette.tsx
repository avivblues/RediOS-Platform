import type { EntityDefinition } from '@redios/shared';
import { Badge, Select } from '../../components/atomic/atoms/Atoms';
import type { RuntimeForm } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

const componentOptions = ['TEXT_INPUT', 'NUMBER_INPUT', 'DATE_PICKER', 'LOOKUP', 'TEXT_AREA', 'SELECT'];

export function FieldPalette({
  entity,
  form,
  selectedFieldCode,
  selectedComponent,
  expertMode,
  onSelect,
  onComponentChange,
}: {
  entity?: EntityDefinition;
  form?: RuntimeForm;
  selectedFieldCode?: string;
  selectedComponent: string;
  expertMode: boolean;
  onSelect: (fieldCode: string) => void;
  onComponentChange: (component: string) => void;
}) {
  const usedFields = new Set(form?.sections.flatMap((section) => section.fields.map((field) => field.fieldCode)) ?? []);

  if (!entity) {
    return (
      <EmptyState
        title="Belum ada data yang dipilih"
        description="Pilih data atau layar input agar daftar informasi bisa ditampilkan."
      />
    );
  }

  return (
    <div className="studio-card studio-edit-panel">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Panel Kiri</span>
          <h4>
            Pilih Informasi
            <HelpTooltip label="Informasi">Informasi adalah detail yang disimpan aplikasi, seperti Nama, Harga, atau Status.</HelpTooltip>
          </h4>
        </div>
      </div>
      <div className="studio-edit-context">
        <strong>{humanizeCode(entity.code)}</strong>
        <span className="studio-muted">{expertMode ? `Technical Code: ${entity.code}` : 'Data yang sedang diedit'}</span>
      </div>
      <h4>
        Bagaimana tampilnya?
        <HelpTooltip label="Jenis Input">Pilih bentuk input yang dilihat pengguna, seperti teks, angka, tanggal, atau pilihan terhubung.</HelpTooltip>
      </h4>
      <div className="studio-component-palette">
        {componentOptions.slice(0, 4).map((component) => (
          <button
            key={component}
            className={selectedComponent === component ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
            onClick={() => onComponentChange(component)}
            title={`Gunakan jenis input ${humanizeCode(component)}.`}
          >
            {humanizeCode(component)}
          </button>
        ))}
      </div>
      <Select value={selectedComponent} options={componentOptions} onChange={onComponentChange} />
      <h4>
        Informasi Tersedia
        <HelpTooltip label="Informasi Tersedia">Pilih atau seret informasi ini ke area tengah agar muncul di layar pengguna.</HelpTooltip>
      </h4>
      {entity.fieldCodes.map((fieldCode) => (
        <button
          key={fieldCode}
          className={selectedFieldCode === fieldCode ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('application/redios-field', fieldCode);
            onSelect(fieldCode);
          }}
          onClick={() => onSelect(fieldCode)}
          title={`Pilih ${humanizeCode(fieldCode)} untuk ditambahkan ke layar.`}
        >
          <span>{humanizeCode(fieldCode)}</span>
          {expertMode ? <span className="studio-muted">{fieldCode}</span> : null}
          {usedFields.has(fieldCode) ? <Badge>Sudah di layar</Badge> : null}
        </button>
      ))}
    </div>
  );
}
