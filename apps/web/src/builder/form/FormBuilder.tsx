import { useState } from 'react';
import type { MetadataDraft } from '@redios/shared';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { BuilderCanvas, Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { FormRenderer } from '../../renderer/FormRenderer';
import { PropertyEditor } from '../property/PropertyEditor';

const palette = ['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT', 'LOOKUP'];

export function FormBuilder({
  form,
  designer,
  onPreview,
}: {
  form?: RuntimeForm;
  designer: DesignerClient;
  onPreview: (preview: DesignerPreviewResult) => void;
}) {
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [selectedComponent, setSelectedComponent] = useState('TEXT_INPUT');
  const [fieldCode, setFieldCode] = useState('');
  const [selectedField, setSelectedField] = useState<RuntimeFormField | undefined>();

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

  async function addSelectedField() {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id || !form || !fieldCode) {
      return;
    }

    setDraft(
      await designer.applyOperation(targetDraft.id, {
        type: 'ADD_FIELD',
        payload: {
          section: form.sections[0]?.code,
          fieldCode,
          component: selectedComponent,
        },
      }),
    );
  }

  async function preview() {
    if (draft?.id) {
      onPreview(await designer.preview(draft.id));
    }
  }

  async function publish() {
    if (draft?.id) {
      await designer.publish(draft.id);
    }
  }

  return (
    <Panel title="Form Builder">
      <div className="studio-builder-grid">
        <div className="studio-card">
          <h4>Field Palette</h4>
          {palette.map((component) => (
            <button
              key={component}
              className={component === selectedComponent ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'}
              draggable
              onDragStart={() => setSelectedComponent(component)}
              onClick={() => setSelectedComponent(component)}
            >
              {component}
            </button>
          ))}
          <Input value={fieldCode} placeholder="new field code" onChange={setFieldCode} />
          <Select value={selectedComponent} options={palette} onChange={setSelectedComponent} />
        </div>
        <BuilderCanvas>
          <div className="studio-section-header">
            <strong>{form?.form ?? 'No form selected'}</strong>
            <Button variant="secondary" onClick={() => void ensureDraft()} disabled={!form}>
              Create Draft
            </Button>
          </div>
          <div
            className="studio-drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void addSelectedField()}
          >
            Drop selected field here to create ADD_FIELD operation
          </div>
          <FormRenderer form={form} />
          <div className="studio-list">
            {form?.sections.flatMap((section) => section.fields).map((field) => (
              <button key={field.fieldCode} className="studio-tree-item" onClick={() => setSelectedField(field)}>
                {field.fieldCode}
              </button>
            ))}
          </div>
        </BuilderCanvas>
        <div className="studio-card">
          <h4>Property Panel</h4>
          <PropertyEditor node={selectedField as unknown as Record<string, unknown> | undefined} onChange={() => undefined} />
          <div className="studio-action-row">
            <Button variant="secondary" onClick={() => void preview()} disabled={!draft}>
              Preview
            </Button>
            <Button onClick={() => void publish()} disabled={!draft}>
              Publish
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
