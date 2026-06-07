import { useState } from 'react';
import type { EntityDefinition, FormDefinition, MetadataDraft } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { PropertyPanel } from './PropertyPanel';

export function FormBuilder({
  form,
  entity,
  designer,
  onPreview,
  onPublished,
}: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
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
    <Panel title="Form Builder">
      <div className="studio-builder-grid">
        <FieldPalette
          entity={entity}
          form={activeForm}
          selectedFieldCode={selectedFieldCode}
          selectedComponent={selectedComponent}
          onSelect={setSelectedFieldCode}
          onComponentChange={setSelectedComponent}
        />
        <FormCanvas form={activeForm} selectedFieldCode={selectedFieldCode} onDropField={(fieldCode) => void addSelectedField(fieldCode)} onSelectField={setSelectedField} />
        <div>
          <PropertyPanel field={selectedField} valid={previewResult?.valid} />
          <div className="studio-card studio-builder-actions">
            <div className="studio-action-row">
              <Button variant="secondary" onClick={() => void preview()} disabled={!draft}>
                Preview
              </Button>
              <Button onClick={() => void publish()} disabled={!draft || !previewResult?.valid}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
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
