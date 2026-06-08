import { useState } from 'react';
import type { EntityDefinition, FormDefinition, MetadataDraft } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { PropertyPanel } from './PropertyPanel';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';
import { GuidedHint } from '../../studio/help/GuidedHint';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { StudioLearningCoach } from '../../studio/help/StudioLearningCoach';

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
    <Panel title="Form Builder">
      <div className="studio-builder-intro">
        <div>
          <h3>
            Input Screens control how users enter and update information
            <HelpTooltip label="Input Screen">An Input Screen is the form users see when creating or editing business data.</HelpTooltip>
          </h3>
          <p className="studio-muted">Choose information, arrange it on the screen, preview the impact, then launch safely.</p>
        </div>
        <div className="studio-flow-indicator">
          <span>1 Choose information</span>
          <span>2 Design screen</span>
          <span>3 Preview impact</span>
          <span>4 Launch</span>
        </div>
      </div>
      <GuidedHint title="How to use this builder">
        Select information on the left, choose how it should appear, drag it into the center screen, then preview before launching changes.
      </GuidedHint>
      <StudioLearningCoach
        title="How to change an Input Screen"
        purpose="This builder controls what users see when they enter or update information."
        steps={[
          { title: '1. Pick information', body: 'Choose a detail from the left panel, such as Name, Price, or Stock.' },
          { title: '2. Pick input type', body: 'Choose how users should fill it in, such as text, number, date, or lookup.' },
          { title: '3. Place it on screen', body: 'Drag the information into the center area.' },
          { title: '4. Preview impact', body: 'Check whether the change affects screens, processes, or reports.' },
          { title: '5. Launch change', body: 'Launch only after the preview says the change is valid.' },
        ]}
        currentTip={draft ? 'Preview the change before launching it.' : 'Choose information on the left and drag it into the center screen.'}
      />
      <div className="studio-builder-grid">
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
        <div>
          <PropertyPanel field={selectedField} valid={previewResult?.valid} expertMode={expertMode} />
          <div className="studio-card studio-builder-actions">
            <div className="studio-muted">
              Data source: {entity ? humanizeCode(entity.code) : 'Choose a data source'}
              {expertMode && entity ? ` | Technical Code: ${entity.code}` : ''}
            </div>
            <GuidedHint title="Need help?">Preview checks whether the change is safe. Launch only becomes available after the preview is valid.</GuidedHint>
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
