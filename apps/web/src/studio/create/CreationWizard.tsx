import { useMemo, useState } from 'react';
import type { DesignerClient } from '../../core/api/designer-client';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { FieldBuilder } from '../field-builder/FieldBuilder';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import { StudioActivityTimeline, type StudioActivityItem } from '../activity/StudioActivityTimeline';
import {
  createInitialCreationDraft,
  type CreationDraft,
  type CreationEntityInput,
  type CreationFieldInput,
} from './creation-types';
import { codeFromLabel, generateMetadataSet } from './metadata-generator';

const steps = ['Application', 'Data Model', 'Fields', 'Experience', 'Review', 'Publish'];

export function CreationWizard({
  designer,
  context,
}: {
  designer: DesignerClient;
  context: RuntimeContext;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CreationDraft>(() => createInitialCreationDraft());
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(0);
  const [activity, setActivity] = useState<StudioActivityItem[]>([]);
  const [publishState, setPublishState] = useState('Not started');
  const generated = useMemo(
    () =>
      generateMetadataSet(draft, {
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: codeFromLabel(draft.application.name || context.applicationCode),
      }),
    [context, draft],
  );
  const selectedEntity = draft.entities[selectedEntityIndex];

  function updateApplication(next: Partial<CreationDraft['application']>) {
    setDraft((current) => ({ ...current, application: { ...current.application, ...next } }));
  }

  function addEntity(entity: CreationEntityInput) {
    setDraft((current) => ({ ...current, entities: [...current.entities, entity] }));
    setSelectedEntityIndex(draft.entities.length);
    pushActivity(`Draft object added: ${entity.name}`, 'ENTITY metadata generated in Studio draft.');
  }

  function addField(field: CreationFieldInput) {
    setDraft((current) => ({
      ...current,
      entities: current.entities.map((entity, index) => (index === selectedEntityIndex ? { ...entity, fields: [...entity.fields, field] } : entity)),
    }));
    pushActivity(`Field added: ${field.label}`, `${field.type} field queued for ${selectedEntity?.name ?? 'object'}.`);
  }

  function generateExperience() {
    setDraft((current) => ({
      ...current,
      forms: generated.forms.map((form) => form.code),
      views: generated.views.map((view) => view.code),
      navigation: generated.navigation ? [generated.navigation.code] : [],
      generated,
    }));
    pushActivity('Experience generated', 'Forms, views, pages, and navigation metadata generated from objects.');
  }

  async function publish() {
    setPublishState('Preparing Designer publish rail');
    pushActivity('Draft created', 'Generated metadata is ready for DesignerEngine-backed publish.');

    // Current backend Designer supports FORM/NAVIGATION draft publishing for existing targets.
    // New APPLICATION/ENTITY/FIELD/VIEW/UI creation remains generated metadata until generic creation targets are enabled.
    setPublishState('Ready for DesignerEngine publish when creation targets are enabled');
    pushActivity('Runtime package pending', 'RuntimeCompiler will activate after DesignerEngine publish.');
  }

  function pushActivity(message: string, detail?: string) {
    setActivity((current) => [{ id: `${Date.now()}:${message}`, message, detail }, ...current].slice(0, 8));
  }

  return (
    <div className="studio-create-grid">
      <Panel title="Create Application">
        <div className="studio-wizard-steps">
          {steps.map((item, index) => (
            <button key={item} className={index === step ? 'studio-tree-item studio-tree-item-active' : 'studio-tree-item'} onClick={() => setStep(index)}>
              {index + 1}. {item}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <section className="studio-wizard-body">
            <h3>Create your application</h3>
            <Input value={draft.application.name} placeholder="Application Name" onChange={(name) => updateApplication({ name })} />
            <Input value={draft.application.description ?? ''} placeholder="Description" onChange={(description) => updateApplication({ description })} />
            <Input value={draft.application.icon ?? ''} placeholder="Icon token" onChange={(icon) => updateApplication({ icon })} />
            <Select value={draft.application.startFrom} options={['Blank', 'Template']} onChange={(startFrom) => updateApplication({ startFrom: startFrom as 'Blank' | 'Template' })} />
          </section>
        ) : null}

        {step === 1 ? <DataModelStep onAddEntity={addEntity} entities={draft.entities} /> : null}

        {step === 2 ? (
          <section className="studio-wizard-body">
            <h3>Add custom fields</h3>
            <Select
              value={String(selectedEntityIndex)}
              options={draft.entities.map((entity, index) => String(index))}
              onChange={(value) => setSelectedEntityIndex(Number(value))}
            />
            {selectedEntity ? <FieldBuilder entities={draft.entities} onAddField={addField} /> : <div className="studio-muted">Create an object first.</div>}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="studio-wizard-body">
            <h3>Generate experience</h3>
            <p className="studio-muted">Generate forms, views, pages, and navigation metadata from your objects.</p>
            <Button onClick={generateExperience} disabled={draft.entities.length === 0}>
              Generate Form, View, Page, and Menu
            </Button>
          </section>
        ) : null}

        {step === 4 ? <ReviewStep draft={{ ...draft, generated }} /> : null}

        {step === 5 ? (
          <section className="studio-wizard-body">
            <h3>Publish</h3>
            <div className="studio-impact studio-impact-info">ValidationEngine: ready</div>
            <div className="studio-impact studio-impact-info">DependencyEngine: ready</div>
            <div className="studio-impact studio-impact-info">RuntimeCompiler: ready after Designer publish</div>
            <div className="studio-muted">{publishState}</div>
            <Button onClick={() => void publish()} disabled={!generated.application || generated.entities.length === 0}>
              Publish
            </Button>
          </section>
        ) : null}

        <div className="studio-action-row">
          <Button variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} disabled={step === steps.length - 1}>
            Next
          </Button>
        </div>
      </Panel>

      <Panel title="Generated Metadata">
        <pre>{JSON.stringify(generated, null, 2)}</pre>
      </Panel>

      <StudioActivityTimeline items={activity} />
    </div>
  );
}

function DataModelStep({
  entities,
  onAddEntity,
}: {
  entities: CreationEntityInput[];
  onAddEntity: (entity: CreationEntityInput) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <section className="studio-wizard-body">
      <h3>Create Object</h3>
      <Input value={name} placeholder="Object name" onChange={setName} />
      <Input value={description} placeholder="Description" onChange={setDescription} />
      <Button
        onClick={() => {
          onAddEntity({ name, description, fields: [] });
          setName('');
          setDescription('');
        }}
        disabled={!name.trim()}
      >
        Add Object
      </Button>
      <div className="studio-list">
        {entities.map((entity) => (
          <div key={entity.name} className="studio-list-row">
            <strong>{entity.name}</strong>
            <span>{entity.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewStep({ draft }: { draft: CreationDraft }) {
  const generated = draft.generated.entities.length > 0 ? draft.generated : generateMetadataSet(draft, { tenantId: 'preview', applicationCode: codeFromLabel(draft.application.name || 'APP'), domainCode: 'preview' });

  return (
    <section className="studio-wizard-body">
      <h3>Visual Review</h3>
      <div className="studio-card">
        <strong>Application</strong>
        <div>{draft.application.name || 'Unnamed Application'}</div>
      </div>
      <div className="studio-card-grid">
        <ReviewMetric label="Objects" value={generated.entities.length} />
        <ReviewMetric label="Forms" value={generated.forms.length} />
        <ReviewMetric label="Views" value={generated.views.length} />
        <ReviewMetric label="Pages" value={generated.pages.length} />
        <ReviewMetric label="Menus" value={generated.navigation?.definition.items.length ?? 0} />
        <ReviewMetric label="Security" value="Default" />
        <ReviewMetric label="Runtime" value="Ready" />
      </div>
      <div className="studio-list">
        {generated.entities.map((entity) => (
          <div key={entity.code} className="studio-list-row">
            <strong>OK {humanizeCode(entity.code)}</strong>
            <span>{entity.definition.fieldCodes.length} fields</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="studio-card">
      <span className="studio-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
