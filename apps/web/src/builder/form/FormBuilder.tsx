import { useState } from 'react';
import type { EntityDefinition, FormDefinition, MetadataDraft } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { PropertyPanel } from './PropertyPanel';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';
import { GuidedHint } from '../../studio/help/GuidedHint';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { StudioLearningCoach } from '../../studio/help/StudioLearningCoach';
import { StudioBadge } from '../../studio/design-system/StudioDesignSystem';
import { MetadataEditor } from '../../studio/editor/MetadataEditor';

export function FormBuilder({
  form,
  entity,
  designer,
  expertMode = false,
  onPreview,
  onPublished,
}: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
  expertMode?: boolean;
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished?: () => void;
}) {
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [selectedComponent, setSelectedComponent] = useState('TEXT_INPUT');
  const [selectedFieldCode, setSelectedFieldCode] = useState('');
  const [selectedField, setSelectedField] = useState<RuntimeFormField | undefined>();
  const [previewResult, setPreviewResult] = useState<DesignerPreviewResult | undefined>();
  const activeForm = draft ? formFromDraft(draft, form) : form;

  async function ensureDraft(): Promise<MetadataDraft | undefined> {
    if (draft || !form) {
      return draft;
    }

    const nextDraft = await designer.createDraft({
      targetType: 'FORM',
      targetCode: form.form,
      entityCode: form.entityCode,
    });
    setDraft(nextDraft);
    return nextDraft;
  }

  async function addSelectedField(fieldCode: string) {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id || !form || !fieldCode) {
      return;
    }

    const updatedDraft = await designer.applyOperation(targetDraft.id, {
      type: 'ADD_FIELD',
      payload: {
        section: form.sections[0]?.code,
        fieldCode,
        component: selectedComponent,
      },
    });
    setDraft(updatedDraft);

    if (updatedDraft.id) {
      const nextPreview = await designer.preview(updatedDraft.id);
      setPreviewResult(nextPreview);
      onPreview(nextPreview);
    }
  }

  async function preview() {
    if (draft?.id) {
      const nextPreview = await designer.preview(draft.id);
      setPreviewResult(nextPreview);
      onPreview(nextPreview);
    }
  }

  async function publish() {
    if (draft?.id && previewResult?.valid) {
      await designer.publish(draft.id);
      setDraft(undefined);
      setPreviewResult(undefined);
      onPublished?.();
    }
  }

  return (
    <MetadataEditor
      definition={{
        mode: 'EDIT',
        title: 'Ubah Layar Input',
        subtitle: 'Gunakan alur yang sama seperti create: pilih informasi, susun layar, pratinjau, lalu terbitkan.',
        status: (
          <>
            <StudioBadge tone={draft ? 'warning' : 'info'}>{draft ? 'Ada rancangan perubahan' : 'Belum ada perubahan'}</StudioBadge>
            {previewResult ? <StudioBadge tone={previewResult.valid ? 'success' : 'danger'}>{previewResult.valid ? 'Pratinjau valid' : 'Perlu diperiksa'}</StudioBadge> : null}
          </>
        ),
      }}
    >
    <div className="studio-edit-flow">
        <div className="studio-builder-intro studio-edit-hero">
          <div>
            <span className="studio-kicker">Edit Aplikasi</span>
            <h3>
              Atur cara pengguna mengisi dan memperbarui informasi
              <HelpTooltip label="Layar Input">Layar Input adalah tampilan yang dipakai pengguna saat membuat atau mengubah data bisnis.</HelpTooltip>
            </h3>
            <p className="studio-muted">Pilih informasi, susun di layar, pratinjau dampaknya, lalu aktifkan perubahan dengan aman.</p>
            <div className="studio-action-row">
              <StudioBadge tone={draft ? 'warning' : 'info'}>{draft ? 'Ada rancangan perubahan' : 'Belum ada perubahan'}</StudioBadge>
              {previewResult ? <StudioBadge tone={previewResult.valid ? 'success' : 'danger'}>{previewResult.valid ? 'Pratinjau valid' : 'Perlu diperiksa'}</StudioBadge> : null}
            </div>
          </div>
          <div className="studio-flow-indicator">
            <span>1 Pilih informasi</span>
            <span>2 Susun layar</span>
            <span>3 Pratinjau dampak</span>
            <span>4 Terbitkan</span>
          </div>
        </div>
        <GuidedHint title="Cara memakai builder ini">
          Pilih informasi di panel kiri, tentukan cara tampilnya, seret ke area tengah, lalu pratinjau sebelum menerbitkan perubahan.
        </GuidedHint>
        <StudioLearningCoach
          title="Cara mengubah Layar Input"
          purpose="Builder ini mengatur apa yang dilihat pengguna saat mereka mengisi atau memperbarui informasi."
          steps={[
            { title: '1. Pilih informasi', body: 'Pilih detail dari panel kiri, misalnya Nama, Harga, atau Stok.' },
            { title: '2. Pilih jenis input', body: 'Tentukan cara pengguna mengisi informasi, misalnya teks, angka, tanggal, atau pilihan terhubung.' },
            { title: '3. Letakkan di layar', body: 'Seret informasi ke area tengah agar muncul untuk pengguna.' },
            { title: '4. Pratinjau dampak', body: 'Periksa apakah perubahan memengaruhi layar, alur kerja, atau laporan.' },
            { title: '5. Terbitkan perubahan', body: 'Terbitkan hanya setelah pratinjau menyatakan perubahan valid.' },
          ]}
          currentTip={draft ? 'Pratinjau perubahan dulu sebelum diterbitkan.' : 'Pilih informasi di sebelah kiri lalu seret ke area tengah.'}
        />
        <div className="studio-edit-builder-grid">
          <FieldPalette
            entity={entity}
            form={activeForm}
            selectedFieldCode={selectedFieldCode}
            selectedComponent={selectedComponent}
            expertMode={expertMode}
            onSelect={setSelectedFieldCode}
            onComponentChange={setSelectedComponent}
          />
          <FormCanvas
            form={activeForm}
            selectedFieldCode={selectedFieldCode}
            expertMode={expertMode}
            onDropField={(fieldCode) => void addSelectedField(fieldCode)}
            onSelectField={setSelectedField}
          />
          <div className="studio-edit-side-panel">
            <PropertyPanel field={selectedField} valid={previewResult?.valid} expertMode={expertMode} />
            <div className="studio-card studio-builder-actions">
              <div className="studio-muted">
                Sumber data: {entity ? humanizeCode(entity.code) : 'Pilih sumber data'}
                {expertMode && entity ? ` | Technical Code: ${entity.code}` : ''}
              </div>
              <GuidedHint title="Butuh bantuan?">Pratinjau memeriksa apakah perubahan aman. Tombol terbitkan aktif setelah pratinjau valid.</GuidedHint>
              <div className="studio-action-row">
                <Button
                  variant="secondary"
                  onClick={() => void preview()}
                  disabled={!draft}
                  tooltip={draft ? 'Cek dampak perubahan sebelum aplikasi diaktifkan.' : 'Ubah layar dulu, lalu pratinjau akan aktif.'}
                >
                  Pratinjau
                </Button>
                <Button
                  onClick={() => void publish()}
                  disabled={!draft || !previewResult?.valid}
                  tooltip={draft && previewResult?.valid ? 'Simpan perubahan dan aktifkan versi terbaru.' : 'Pratinjau harus valid dulu sebelum bisa diterbitkan.'}
                >
                  Terbitkan
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
    </MetadataEditor>
  );
}

function formFromDraft(draft: MetadataDraft, fallback?: RuntimeForm): RuntimeForm | undefined {
  const definition = draft.draft.definition as FormDefinition | undefined;

  if (!definition?.layout || !fallback) {
    return fallback;
  }

  return {
    form: definition.code,
    entityCode: definition.entityCode,
    name: definition.name,
    version: definition.version,
    layout: definition.layout.type,
    theme: fallback.theme,
    sections: definition.layout.sections.map((section) => ({
      code: section.code,
      fields: section.fields.map((field) => ({
        fieldCode: field.fieldCode,
        component: field.component,
        order: field.order,
        required: field.required,
        readonly: field.readonly ?? false,
        visible: field.visible ?? true,
        binding: field.binding ? { ...field.binding, path: field.fieldCode } : undefined,
        relation: field.lookup
          ? {
              code: field.lookup.relationCode,
              target: '',
              valueField: '',
            }
          : undefined,
        view: field.lookup
          ? {
              code: field.lookup.viewCode,
              entityCode: '',
              type: '',
              columns: [],
            }
          : undefined,
      })),
    })),
  };
}
