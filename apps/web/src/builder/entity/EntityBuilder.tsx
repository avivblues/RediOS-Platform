import { useState } from 'react';
import type { MetadataDraft } from '@redios/shared';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';

export function EntityBuilder({
  entityCode,
  form,
  designer,
  onPreview,
}: {
  entityCode?: string;
  form?: RuntimeForm;
  designer: DesignerClient;
  onPreview: (preview: DesignerPreviewResult) => void;
}) {
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [fieldCode, setFieldCode] = useState('');
  const [component, setComponent] = useState('TEXT_INPUT');
  const fields = form?.sections.flatMap((section) => section.fields) ?? [];

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

  async function addField() {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id || !form || !fieldCode) {
      return;
    }

    const updated = await designer.applyOperation(targetDraft.id, {
      type: 'ADD_FIELD',
      payload: {
        section: form.sections[0]?.code,
        fieldCode,
        component,
      },
    });
    setDraft(updated);
  }

  async function removeField(field: RuntimeFormField) {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id) {
      return;
    }

    setDraft(
      await designer.applyOperation(targetDraft.id, {
        type: 'REMOVE_FIELD',
        payload: {
          fieldCode: field.fieldCode,
        },
      }),
    );
  }

  async function toggleRequired(field: RuntimeFormField, index: number) {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id) {
      return;
    }

    setDraft(
      await designer.applyOperation(targetDraft.id, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.0.fields.${index}.required`,
        after: !field.required,
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
    <Panel title="Entity Builder">
      <div className="studio-section-header">
        <div>
          <strong>{entityCode ?? 'No entity selected'}</strong>
          <div className="studio-muted">Fields are edited through form draft operations.</div>
        </div>
        <Button variant="secondary" onClick={() => void ensureDraft()} disabled={!form}>
          Create Draft
        </Button>
      </div>
      <div className="studio-action-row">
        <Input value={fieldCode} placeholder="fieldCode" onChange={setFieldCode} />
        <Select value={component} options={['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT', 'LOOKUP', 'BADGE']} onChange={setComponent} />
        <Button onClick={() => void addField()} disabled={!form || !fieldCode}>
          Add Field
        </Button>
      </div>
      <div className="studio-list">
        {fields.map((field, index) => (
          <div key={field.fieldCode} className="studio-list-row">
            <span>{field.fieldCode}</span>
            <span>{field.component}</span>
            <Button variant="secondary" onClick={() => void toggleRequired(field, index)}>
              Required: {String(field.required)}
            </Button>
            <Button variant="danger" onClick={() => void removeField(field)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="studio-action-row">
        <Button variant="secondary" onClick={() => void preview()} disabled={!draft}>
          Preview
        </Button>
        <Button onClick={() => void publish()} disabled={!draft}>
          Publish
        </Button>
      </div>
    </Panel>
  );
}
